const express = require("express");
const router = express.Router();
const linkController = require("../controllers/linkControllers");

// POST /api/links - Create link
router.post("/", linkController.createLink);

// GET /api/links - List all links
router.get("/", linkController.getAllLinks);

// GET /api/links/:code - Stats for one code
router.get("/:code", linkController.getLinkStats);

// DELETE /api/links/:code - Delete link
router.delete("/:code", linkController.deleteLink);

module.exports = router;
