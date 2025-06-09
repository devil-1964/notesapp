const {z} =require("zod")

const noteSchema=z.object(
    {
        title:z.string()
        .min(1,"Title is required")
        .max(255,"Title cannot exceed 255 character"),
        content:z.string()
        .min(1,"Content is required")
        .max(100000,"Content is too large")
    }
)

module.exports={ noteSchema }