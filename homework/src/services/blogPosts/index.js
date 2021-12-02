import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { postBlogValidation } from "./validation.js";
import { getBlogPosts, writeBlogPosts } from "../../lib/fs-tools.js";

const blogPostsRouter = express.Router();

/* const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "./blogPosts.json"
);

const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath));

const writeBlogPosts = (blogPosts) => {
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPosts));
}; */

/* 
GET /blogPosts => returns the list of blogposts
GET /blogPosts /123 => returns a single blogpost
POST /blogPosts => create a new blogpost
PUT /blogPosts /123 => edit the blogpost with the given id
DELETE /blogPosts /123 => delete the blogpost with the given id
*/

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    if (blogPosts) {
      res.status(200).json(blogPosts);
    } else {
      next(createHttpError(404, "No blogposts found"));
    }
  } catch (error) {
    next(error);
  }
});

/* 
{	
"_id": "SERVER GENERATED ID",
"category": "ARTICLE CATEGORY",
"title": "ARTICLE TITLE",
"cover":"ARTICLE COVER (IMAGE LINK)",
"readTime": {
	"value": 2,
  "unit": "minute"
 },
"author": {
    "name": "AUTHOR AVATAR NAME",
    "avatar":"AUTHOR AVATAR LINK"
    },
 "content":"HTML",
 "createdAt": "NEW DATE"
}
*/
blogPostsRouter.post("/", postBlogValidation, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      next(
        createHttpError(400, "Invalid blogpost data", {
          errors: errorList.array(),
        })
      );
    } else {
      const newBlogPost = {
        ...req.body,
        _id: uniqid(),
        category: req.body.category.toUpperCase(),
        title: req.body.title.toUpperCase(),
        cover: req.body.cover,
        readTime: {
          value: req.body.readTime.value,
          unit: req.body.readTime.unit,
        },
        author: {
          name: req.body.author.name,
          avatar: req.body.author.avatar,
          _id: uniqid(),
        },
        content: req.body.content,
        createdAt: new Date().toISOString(),
      };
      const blogPosts = await getBlogPosts();
      blogPosts.push(newBlogPost);
      await writeBlogPosts(blogPosts);
      res.status(201).send(newBlogPost);
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const blogPost = blogPosts.find(
      (blogPost) => blogPost._id === req.params.blogPostId
    );
    if (blogPost) {
      res.status(200).send(blogPost);
    } else {
      next(createHttpError(404, "No blogpost found"));
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const index = blogPosts.findIndex(
      (blogPost) => blogPost._id === req.params.blogPostId
    );
    if (index === -1) {
      next(createHttpError(404, "No blogpost found"));
    } else {
      const blogPostToUpdate = blogPosts[index];
      const updatedFields = req.body;
      const updatedBlogPost = {
        ...blogPostToUpdate,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };
      blogPosts[index] = updatedBlogPost;
      await writeBlogPosts(blogPosts);
      res.status(200).send(updatedBlogPost);
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const remainingBlogPosts = blogPosts.filter(
      (blogPost) => blogPost._id !== req.params.blogPostId
    );
    if (remainingBlogPosts) {
      await writeBlogPosts(remainingBlogPosts);
      res
        .status(200)
        .send(`Blog Post with Id ${req.params.blogPostId} was deleted`);
    } else {
      next(createHttpError(404, "No blogpost found"));
    }
  } catch (error) {
    next(error);
  }
});
export default blogPostsRouter;

/* Extra 
GET /blogPosts?title=whatever => filter the blogposts and extract the only that match the condition (es.: title contains "whatever")
*/
