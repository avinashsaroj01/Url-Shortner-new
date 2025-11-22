const Link = require("../db/Link");

// Regex: Codes follow [A-Za-z0-9]{6,8}.
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

//POST /api/links - Create link

exports.createLink = async (req, res) => {
  console.log("request body" , req.body);
  const { targetUrl, customCode } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ message: "Target URL is required." });
  }

  // 1. Validate customCode format if provided
  if (customCode && !CODE_REGEX.test(customCode)) {
    return res
      .status(400)
      .json({ message: "Custom code must be 6-8 alphanumeric characters." });
  }

  try {
    let code = customCode;

    // 2. Generate code if customCode is not provided
    if (!code) {
      code = await Link.generateUniqueCode();
    } else {
      // 3. Check if custom code already exists
      const existingLink = await Link.findOne({ code });
      if (existingLink) {
        //  duplicate codes return 409
        return res
          .status(409)
          .json({
            message: "Custom code already exists. Please choose another one.",
          });
      }
    }

    // 4. Create and save the new link
    const newLink = await Link.create({
      code,
      targetUrl,
    });

    // Return 201 Created and the new link object
    return res.status(201).json({
      code: newLink.code,
      targetUrl: newLink.targetUrl,
      totalClicks: newLink.totalClicks,
      createdAt: newLink.createdAt,
      lastClickedTime: newLink.lastClickedTime,
    });
  } catch (error) {
    console.error("Error in createLink:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during link creation." });
  }
};


 // GET /api/links - List all links
 
exports.getAllLinks = async (req, res) => {
  try {
    // Sort by createdAt descending (newest first) to match dashboard expectations
    const links = await Link.find().sort({ createdAt: -1 }).select("-__v");
    return res.status(200).json(links);
  } catch (error) {
    console.error("Error in getAllLinks:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching links." });
  }
};

/**
 * GET /api/links/:code - Stats for one code
 */
exports.getLinkStats = async (req, res) => {
  const { code } = req.params;
  try {
    const link = await Link.findOne({ code }).select("-__v");

    if (!link) {
      return res.status(404).json({ message: "Link not found." });
    }

    // Return link details including click count and times
    return res.status(200).json(link);
  } catch (error) {
    console.error("Error in getLinkStats:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while fetching stats." });
  }
};

/**
 * DELETE /api/links/:code - Delete link
 */
exports.deleteLink = async (req, res) => {
  const { code } = req.params;
  try {
    const result = await Link.deleteOne({ code });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Link not found or already deleted." });
    }

    // Successful deletion should return 204 No Content
    return res.status(204).send();
  } catch (error) {
    console.error("Error in deleteLink:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during link deletion." });
  }
};
