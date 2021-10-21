import express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./authors/index.js";
import postsRouter from "./posts/index.js";
import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notFoundHandler } from "./errorHandlers.js"
import cors from "cors";

const server = express();
// *********************** GLOBAL MIDDLEWARES *********************
server.use(cors());
server.use(express.json());
// ************************ ENDPOINTS **********************
server.use("/authors", authorsRouter);
server.use("/posts", postsRouter);
// *********************** ERROR MIDDLEWARES ***************************
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)




const port = 3001;

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log("Serveris running on port:", port);
});
