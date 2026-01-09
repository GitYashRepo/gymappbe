const express = require("express");
const router = express.Router();
const {
  createGymPod,
  getHomePods,
  getPodDetails,
  togglePodStatus,
  updateGymPod,
  getAdminPods,
  deleteGymPod,
} = require("../controllers/gymPod.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const uploadGymPodImages = require("../middlewares/gymPodUpload.middleware");


// ADMIN
router.post("/create-pods", protect, adminOnly, uploadGymPodImages.single("image"), createGymPod);
router.patch("/:id/toggle", protect, adminOnly, togglePodStatus );
router.get("/admin-pods", protect, adminOnly, getAdminPods );
router.delete("/:id", protect, adminOnly, deleteGymPod );
router.put("/:id", protect, adminOnly, uploadGymPodImages.single("image"), updateGymPod );

// USER
router.get("/get-pods", getHomePods);
router.get("/:id", getPodDetails);

module.exports = router;
