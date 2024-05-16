import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { UserQueryType } from './queries';
import type { users as UserType } from'@prisma/client'
import {sent_emails_message_type as ReminderType} from '@prisma/client'
import { Prisma } from '@prisma/client'
import Userjobs, { UserReminderType } from '../../helpers/schedules/users'
import { Queue } from 'bull'
import UserServices from './userServices';

export default function (queue: Queue, UserQuery: UserQueryType): express.Router {
  const router: express.Router = express.Router();

  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await UserQuery.getUsers();

      res.send({ users });
      next();
    },
  );

  router.post(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
      const newUser: UserType = req.body.user;
      if (!newUser || !newUser.fullname || !newUser.email || !newUser.timezone) {
        res.status(400).send({ message: 'Data user is incomplete' });
        return
      }
      try {
        const userData: UserType = {
          ...newUser,
          ...newUser.birthday ? {birthday: new Date(newUser.birthday)} : null,
          ...newUser.anniversary_date ? {anniversary_date: new Date(newUser.anniversary_date)} : null,
        }
        const createdUser = await UserQuery.createUser(userData);
        if (createdUser) {
          if (createdUser.birthday) {
            Userjobs.addUsersBirthdayJobs(queue, createdUser, 1); // add job queue
          }
          if (createdUser.anniversary_date) {
            Userjobs.addUsersAnniversaryJobs(queue, createdUser, 1); // add job queue
          }
          res.send({ createdUser });
        } else {
          res.status(500).send({ message: 'Internal server error' });
        }
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          console.warn(e)
        }
        res.status(500).send({ message: 'Internal server error' });
      }
      
      next();
    },
  );

  router.put(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
      const newUser: UserType = req.body.user;
      if (!newUser || !newUser.id || (!newUser.fullname && !newUser.email && !newUser.birthday && !newUser.anniversary_date && !newUser.timezone)) {
        res.status(400).send({ message: 'Data user is incomplete' });
        return
      }
      try {
        const userData: UserType = {
          ...newUser,
          ...newUser.birthday ? {birthday: new Date(newUser.birthday)} : null,
          ...newUser.anniversary_date ? {anniversary_date: new Date(newUser.anniversary_date)} : null,
        }
        const users = await UserQuery.updateUser(userData);
        
        res.send({ users });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          console.warn(e)
        }
        res.status(500).send({ message: 'Internal server error' });
      }
      
      next();
    },
  );

  router.delete(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
      const userId: number = req.body.userId;
      if (!userId) {
        res.status(400).send({ message: 'User ID is required' });
        return
      }
      try {
        const users = await UserQuery.deleteUser(userId);
        
        res.send({ users });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          console.warn(e)
        }
        res.status(500).send({ message: 'Internal server error' });
      }
      
      next();
    },
  );

  return router;
}
