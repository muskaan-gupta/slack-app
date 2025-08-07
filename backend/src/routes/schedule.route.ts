import express from 'express';
import { 
    getScheduledMessages, 
    cancelScheduledMessage 
} from '../controllers/scheduller.controller';

const router = express.Router();

router.get('/', getScheduledMessages);
router.delete('/:id', cancelScheduledMessage);

export default router;
