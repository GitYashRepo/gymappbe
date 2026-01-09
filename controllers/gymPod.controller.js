const GymPod = require("../models/GymPod");

/* ================= CREATE POD ================= */
exports.createGymPod = async (req, res) => {
  try {
    const {
      name,
      locationName,
      pricePer30Min,
      description,
      maxCapacity,
    } = req.body;


    if (!name || !locationName || !pricePer30Min || !maxCapacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image not received by backend",
      });
    }

    const pod = await GymPod.create({
      name,
      locationName,
      pricePer30Min: Number(pricePer30Min),
      maxCapacity: Number(maxCapacity),
      description,
      images: [req.file.path],
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Gym pod created",
      data: pod
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};



/* ================= USER: HOME PODS ================= */
exports.getHomePods = async (req, res) => {
  try {
    const pods = await GymPod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("name locationName pricePer30Min description maxCapacity images");

    res.status(200).json({
      success: true,
      data: pods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= USER: POD DETAILS ================= */
exports.getPodDetails = async (req, res) => {
  try {
    const pod = await GymPod.findById(req.params.id);
    if (!pod) return res.status(404).json({ message: "Pod not found" });

    res.status(200).json({
      success: true,
      data: pod,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: TOGGLE ================= */
exports.togglePodStatus = async (req, res) => {
  const pod = await GymPod.findById(req.params.id);
  if (!pod) return res.status(404).json({ message: "Pod not found" });

  pod.isActive = !pod.isActive;
  await pod.save();

  res.status(200).json({
    success: true,
    isActive: pod.isActive,
  });
};

/* ================= ADMIN: UPDATE POD ================= */
exports.updateGymPod = async (req, res) => {
  try {
    const pod = await GymPod.findById(req.params.id);
    if (!pod) return res.status(404).json({ message: "Pod not found" });

    if (pod.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      locationName,
      pricePer30Min,
      description,
      maxCapacity,
    } = req.body;

    pod.name = name;
    pod.locationName = locationName;
    pod.pricePer30Min = Number(pricePer30Min);
    pod.maxCapacity = Number(maxCapacity);
    pod.description = description;

    // 🔥 REPLACE IMAGE
    if (req.file) {
      pod.images = [req.file.path];
    }

    await pod.save();

    res.status(200).json({
      success: true,
      data: pod,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: DELETE ================= */
exports.deleteGymPod = async (req, res) => {
  try {
    const pod = await GymPod.findById(req.params.id);
    if (!pod) return res.status(404).json({ message: "Pod not found" });

    if (pod.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pod.deleteOne();

    res.status(200).json({
      success: true,
      message: "Pod deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: GET PODS ================= */
exports.getAdminPods = async (req, res) => {
  try {
    const pods = await GymPod.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: pods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
