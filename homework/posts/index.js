/* GET /blogPosts => returns the list of blogposts
GET /blogPosts /123 => returns a single blogpost
POST /blogPosts => create a new blogpost
PUT /blogPosts /123 => edit the blogpost with the given id
DELETE /blogPosts /123 => delete the blogpost with the given id */

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { postsValidationMiddelwares } from "./validation.js";

const postsRouter = express.Router();

const postsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "posts.json"
);

const getPosts = () => JSON.parse(fs.readFileSync(postsJSONPath));
const writePosts = (content) =>
  fs.writeFileSync(postsJSONPath, JSON.stringify(content));

//1 POST CRUD ENDPOINT
postsRouter.post("/", postsValidationMiddelwares, (req, res, next) => {
  try {
    const newPost = { ...req.body, createdAt: new Date(), _id: uniqid() };
    const posts = getPosts();

    posts.push(newPost);
    writePosts(posts);

    res.status(201).send({ _id: newPost._id });
  } catch (error) {
    next(error);
  }
});

//2 GET CRUD ENDPOINT
postsRouter.get("/", (req, res, next) => {
  try {
    const posts = getPosts();
    if (req.query && req.query.title) {
      const filteredPosts = posts.filter(
        (post) => post.title === req.query.title
      );
      res.send(filteredPosts);
    } else {
      res.send(posts);
    }
  } catch (error) {
    next(error);
  }
});

//3 GET CRUD ENDPOINT
postsRouter.get("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();
    const post = posts.find((b) => b._id === req.params.postId);
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `Post with id ${req.params.postId}`));
    }
  } catch (error) {
    next(error);
  }
});

//4 PUT CRUD ENDPOINT

postsRouter.put("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();
    const index = posts.findIndex((post) => post._id === req.params.postId);
    const postToModify = posts[index];
    const updatedFields = req.body;

    const updatedPost = { ...postToModify, ...updatedFields };

    posts[index] = updatedPost;

    writePosts(posts);
    res.send(updatedPost);
  } catch (error) {
    next(error);
  }
});

//5 Delete CRUD ENDPOINT
postsRouter.delete("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();
    const remainingPosts = posts.filter(
      (post) => post._id !== req.params.postId
    );
    writePosts(remainingPosts);
    res.status(204).send("The content is deleted!");
  } catch (error) {
    next(error);
  }
});

export default postsRouter;
