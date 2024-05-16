/* eslint-disable @typescript-eslint/no-var-requires */
import express from "express";
// import { logResponse } from './helpers/response'
import path from "path";
import UserController from "./modules/users/usersController";
import type { UserQueryType } from "./modules/users/queries";
import InitJobs from './helpers/schedules/init';
import ReminderJobs from './helpers/schedules/users';

require("dotenv").config();
function runApp(userQueries: UserQueryType): express.Application {
  const app: express.Application = express();

  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(express.json({ limit: "10mb" }));

  InitJobs.getInstance();
  ReminderJobs.process(InitJobs.getQueue());

  app.use("/users", UserController(InitJobs.getQueue(), userQueries));

  app.use("/docs", express.static(path.join(__dirname, "../docs")));

  return app;
}

export default runApp;
