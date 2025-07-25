import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send({
    data: [
      {
        id: 1,
        firstName: "Krishna Kamal",
        lastName: "Nath",
      },
      {
        id: 2,
        firstName: "K K",
        lastName: "Nath",
      },
    ],
  });
});

export default router;
