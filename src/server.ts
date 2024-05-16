import runApp from "./app";
import userQueries from "./modules/users/queries";

const app = runApp(userQueries);

app.listen(8000, () => {
  console.warn("Active port: 8000");
});
