import { Queue, Job } from 'bull';
import { ScheduleNames } from '../constants'
import { users as UserType, sent_emails_message_type as ReminderType } from '@prisma/client';
import userServices from '../../modules/users/userServices'

export interface UserReminderType {
  userId: number;
  email: string;
  reminderDate: Date;
  reminderType: ReminderType,
  message: string;
  attempts: number;
}

export default class ReminderJob {
  public static async process(queue: Queue): Promise<void> {
    queue.process(ScheduleNames.sendEmail, async (job: Job) => {
      const userReminder = job.data as UserReminderType;
    
      // Check if user still exists and their birthday is today before sending the email
      const user = await userServices.checkUserReminder(userReminder.userId, userReminder.reminderType);
      if (user) {
        if (await userServices.checkEmailAlreadySent(userReminder.userId, userReminder.reminderType)) {
          await userServices.sendEmailReminder(userReminder, user); // Dummy name, you can fetch user details from the database
        }
      } else {
        await job.remove(); // Remove job from the queue if user does not exist or not their birthday
      }
    });
  }

  public static async addUsersBirthdayJobs (queue: Queue, user: UserType, attempts: number) {
    if (user.birthday) {
      const birthday = new Date(user.birthday);
  
      const reminderData: UserReminderType = {
        userId: user.id,
        email: user.email,
        reminderDate: birthday,
        reminderType: ReminderType.birthday,
        message: 'Happy Birthday',
        attempts
      }
      
      queue.add(ScheduleNames.sendEmail, reminderData, {
        repeat: { cron: `0 ${9 + attempts - 1} ${birthday.getDate()} ${(birthday.getMonth() + 1)} *` }
      });
      console.warn('Queue Added', user);
    }
  }

  public static async addUsersAnniversaryJobs (queue: Queue, user: UserType, attempts: number) {
    if (user.anniversary_date) {
      const anniversary = new Date(user.anniversary_date);
  
      const reminderData: UserReminderType = {
        userId: user.id,
        email: user.email,
        reminderDate: anniversary,
        reminderType: ReminderType.anniversary,
        message: 'Happy Anniversary',
        attempts
      }
      
      queue.add(ScheduleNames.sendEmail, reminderData, {
        repeat: { cron: `0 ${9 + attempts - 1} ${anniversary.getDate()} ${(anniversary.getMonth() + 1)} *` }
      });
      console.warn('Queue Added', user);
    }
  }
}