

exports.generateSlots = (date) => {
  const slots = [];

  let start = new Date(`${date}T06:00:00`);
  const end = new Date(`${date}T23:00:00`);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + 30 * 60 * 1000);

    slots.push({
      startTime: new Date(start),
      endTime: slotEnd
    });

    start = slotEnd;
  }

  return slots;
};
