import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken, generateToken } from '../utils/cryptoToken.js';
import { sendMail } from '../utils/sendEmail.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production' || env.isCrossOriginAuth,
  sameSite: env.cookieSameSite,
  maxAge: maxAgeMs,
  path: '/',
});

const clearCookieOpts = () => ({
  path: '/',
  httpOnly: true,
  secure: env.nodeEnv === 'production' || env.isCrossOriginAuth,
  sameSite: env.cookieSameSite,
});

function parseDurationMs(expiresStr) {
  const m = /^(\d+)([smhd])$/.exec(expiresStr || '7d');
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const u = m[2];
  const mult = u === 's' ? 1000 : u === 'm' ? 60000 : u === 'h' ? 3600000 : 86400000;
  return n * mult;
}

async function addRefreshToken(user, rawToken, rememberMe, req) {
  user.trimRefreshTokens();
  user.refreshTokens.push({
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + parseDurationMs(rememberMe ? env.jwtRefreshRememberExpires : env.jwtRefreshExpires)),
    userAgent: req.headers['user-agent']?.slice(0, 200),
  });
  await user.save();
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const verifyToken = generateToken(24);
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: hashToken(verifyToken),
    emailVerificationExpire: new Date(Date.now() + 24 * 3600000),
  });

  const link = `${env.clientUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Verify your Atlas Commerce account',
    text: `Verify: ${link}`,
    html: `<p>Click to verify your email:</p><p><a href="${link}">${link}</a></p>`,
  });

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const rememberMe = !!req.body.rememberMe;
  const refreshToken = signRefreshToken({ id: user._id.toString() }, rememberMe);
  await addRefreshToken(await User.findById(user._id).select('+refreshTokens'), refreshToken, rememberMe, req);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(parseDurationMs(rememberMe ? env.jwtRefreshRememberExpires : env.jwtRefreshExpires)));
  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
    accessToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ id: user._id.toString() }, !!rememberMe);
  await addRefreshToken(user, refreshToken, !!rememberMe, req);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts(parseDurationMs(rememberMe ? env.jwtRefreshRememberExpires : env.jwtRefreshExpires)));
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'No refresh token');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    res.clearCookie(REFRESH_COOKIE, clearCookieOpts());
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) throw new ApiError(401, 'User not found');

  const hashed = hashToken(token);
  const match = user.refreshTokens?.find((t) => t.tokenHash === hashed && t.expiresAt > new Date());
  if (!match) {
    res.clearCookie(REFRESH_COOKIE, clearCookieOpts());
    throw new ApiError(401, 'Refresh token revoked');
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== hashed);
  const newRefresh = signRefreshToken({ id: user._id.toString() });
  const rememberMs = Math.max(match.expiresAt - Date.now(), 3600000);
  user.refreshTokens.push({
    tokenHash: hashToken(newRefresh),
    expiresAt: new Date(Date.now() + rememberMs),
    userAgent: req.headers['user-agent']?.slice(0, 200),
  });
  await user.save();

  res.cookie(REFRESH_COOKIE, newRefresh, cookieOpts(rememberMs));
  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token && req.user) {
    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user) {
      const hashed = hashToken(token);
      user.refreshTokens = (user.refreshTokens || []).filter((t) => t.tokenHash !== hashed);
      await user.save();
    }
  }
  res.clearCookie(REFRESH_COOKIE, clearCookieOpts());
  res.json({ success: true, message: 'Logged out' });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshTokens');
  if (user) {
    user.refreshTokens = [];
    await user.save();
  }
  res.clearCookie(REFRESH_COOKIE, clearCookieOpts());
  res.json({ success: true });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If an account exists, a reset link was sent.' });
  }
  const raw = generateToken(32);
  user.passwordResetToken = hashToken(raw);
  user.passwordResetExpire = new Date(Date.now() + 3600000);
  await user.save();

  const link = `${env.clientUrl}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Reset your password',
    text: `Reset: ${link}`,
    html: `<p><a href="${link}">Reset password</a></p>`,
  });

  res.json({ success: true, message: 'If an account exists, a reset link was sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({
    email,
    passwordResetToken: hashToken(token),
    passwordResetExpire: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpire');
  if (!user) throw new ApiError(400, 'Invalid or expired token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  user.refreshTokens = [];
  await user.save();

  res.clearCookie(REFRESH_COOKIE, clearCookieOpts());
  res.json({ success: true, message: 'Password updated. Please log in again.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  const user = await User.findOne({
    email,
    emailVerificationToken: hashToken(token),
    emailVerificationExpire: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpire');
  if (!user) throw new ApiError(400, 'Invalid or expired verification link');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json({ success: true, user });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = req.body;
  if (addr.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(addr);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { id } = req.params;
  const idx = user.addresses.findIndex((a) => a._id.toString() === id);
  if (idx === -1) throw new ApiError(404, 'Address not found');
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(user.addresses[idx], req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});
