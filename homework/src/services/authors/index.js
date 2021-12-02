import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

const authorsRouter = express.Router();
//------------------- File Path as no DB connection-------------------

const currentFilePath = fileURLToPath(import.meta.url);
const currentFolderPath = dirname(currentFilePath);
const authorsJSONPath = join(currentFolderPath, "authors.json");

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../blogPosts/blogPosts.json"
);
console.log(blogPostsJSONPath);
const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath));
//--------------------------------------
/* 
name
surname
ID (Unique and server-generated)
email
date of birth
avatar (e.g. https://ui-avatars.com/api/?name=John+Doe) 
*/
//------------------- ENDPOINTS-------------------

authorsRouter.get("/", (req, res, next) => {
  try {
    const fileContent = fs.readFileSync(authorsJSONPath);
    const authors = JSON.parse(fileContent);
    res.status(201).send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/", (req, res, next) => {
  try {
    const newAuthor = {
      ...req.body,
      createdAt: new Date(),
      id: uniqid(),
      avatar: req.body.avatar,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth,
    };
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
    authors.push(newAuthor);
    fs.writeFileSync(authorsJSONPath, JSON.stringify(authors));
    authors.forEach((author) => {
      if (author.email === req.body.email) {
        res.status(400).send({ error: "E-mail already in use" });
      } else {
        res.status(201).send({ id: author.id });
      }
    });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", (req, res, next) => {
  try {
    const fileContent = fs.readFileSync(authorsJSONPath);
    const authors = JSON.parse(fileContent);
    const author = authors.find((author) => author.id === req.params.authorId);
    res.status(200).send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", (req, res, next) => {
  try {
    const fileContent = fs.readFileSync(authorsJSONPath);
    const author = JSON.parse(fileContent);
    const authorIndex = author.findIndex(
      (author) => author.id === req.params.authorId
    );
    author[authorIndex] = {
      ...author[authorIndex],
      ...req.body,
      updatedAt: new Date(),
    };
    fs.writeFileSync(authorsJSONPath, JSON.stringify(author));
    res.status(200).send(author[authorIndex]);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", (req, res, next) => {
  try {
    const fileContent = fs.readFileSync(authorsJSONPath);
    const author = JSON.parse(fileContent);
    const newAuthor = author.filter(
      (author) => author.id !== req.params.authorId
    );
    fs.writeFileSync(authorsJSONPath, JSON.stringify(newAuthor));
    res
      .status(204)
      .send(`Author with id ${req.body.name} ${req.body.surname} was deleted`);
  } catch (error) {
    next(error);
  }
});

/*Extra 
GET /authors/:id/blogPosts/ => get all the posts for an author with a given ID
*/

authorsRouter.get("/:authorId/blogPosts", (req, res, next) => {
  try {
    const blogPosts = getBlogPosts();
    const authorBlogPosts = blogPosts.filter(
      (blogPost) => blogPost.author._id === req.params.authorId
    );
    res.status(200).send(authorBlogPosts);
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
