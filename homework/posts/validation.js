import {body} from "express-validator"

export const postsValidationMiddelwares = [body("title").exists().withMessage("Title is a mandatory field!")]
