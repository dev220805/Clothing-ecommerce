import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  listingCreateRules,
  listingUpdateRules,
  listingIdParam,
} from '../validators/listingValidators.js';
import * as ctrl from '../controllers/listingController.js';

const router = Router();

router.use(protect);

router.get('/mine', ctrl.listMine);
router.get('/:id', listingIdParam, validate, ctrl.getMine);
router.post('/', listingCreateRules, validate, ctrl.createListing);
router.patch('/:id', listingUpdateRules, validate, ctrl.updateListing);
router.delete('/:id', listingIdParam, validate, ctrl.deleteListing);

export default router;
