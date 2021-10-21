import express from "express"; // 3RD PARTY MODULE (does need to be installed)
import fs from "fs"; // CORE MODULE (doesn't need to be installed)
import { fileURLToPath } from "url"; // CORE MODULE (doesn't need to be installed)
import { dirname, join } from "path"; // CORE MODULE (doesn't need to be installed)
import uniqid from "uniqid"; // 3RD PARTY MODULE (does need to be installed)

const authorsRouter = express.Router();

const currentFilePath = fileURLToPath(import.meta.url);
const parentFolderPath = dirname(currentFilePath);
const authorsJSONPath = join(parentFolderPath, "authors.json");

authorsRouter.get("/", (req, res) => {
  const fileContent = fs.readFileSync(authorsJSONPath);
  console.log(JSON.parse(fileContent));
  const arrayOfAuthors = JSON.parse(fileContent);
  res.send(arrayOfAuthors);
});

authorsRouter.post("/", (req, res) => {
  console.log(req.body);
  const newAuthor = { ...req.body, createdAt: new Date(), ID: uniqid() };
  console.log(newAuthor);

  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));

  authors.push(newAuthor);

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors));

  res.status(201).send({ ID: newAuthor.ID });
});

authorsRouter.put("/:authorId", (req, res) => {
  console.log(req.body);
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));

  const index = authors.findIndex(
    (author) => author.ID === req.params.authorId
  );

  const updatedAuthor = { ...authors[index], ...req.body };

  authors[index] = updatedAuthor;

  fs.writeFileSync(authorsJSONPath, JSON.stringify(authors));

  res.send(updatedAuthor);
});

authorsRouter.delete("/:authorId", (req, res) => {
  console.log(req.body);
  const author = JSON.parse(fs.readFileSync(authorsJSONPath));

  const remainingAuthors = author.filter(
    (author) => author.id !== req.params.authorId
  );

  fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors));

  res.status(204).send();
});

authorsRouter.get("/:authorId", (req, res) => {
  const authors = JSON.parse(fs.readFileSync(authorsJSONPath));
  const author = authors.find((s) => s.ID === req.params.authorId);
  res.send(author);
});

export default authorsRouter;
