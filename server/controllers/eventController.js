const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public / Private
exports.getEvents = async (req, res) => {
  try {
    const { type, timeframe = 'upcoming' } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.eventType = type;
    }

    const now = new Date();
    if (timeframe === 'upcoming') {
      query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (timeframe === 'past') {
      query.date = { $lt: now };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName usn department profilePicture role')
      .sort({ date: 1 });

    const formatted = events.map(evt => {
      const eObj = evt.toObject();
      eObj.interestedCount = evt.interestedStudents ? evt.interestedStudents.length : 0;
      eObj.isInterested = req.user && evt.interestedStudents ? evt.interestedStudents.some(id => id.toString() === req.user._id.toString()) : false;
      return eObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      events: formatted
    });
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving events' });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public / Private
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'fullName usn department profilePicture role')
      .populate('interestedStudents', 'fullName usn department profilePicture');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const eObj = event.toObject();
    eObj.interestedCount = event.interestedStudents ? event.interestedStudents.length : 0;
    eObj.isInterested = req.user && event.interestedStudents ? event.interestedStudents.some(u => u._id.toString() === req.user._id.toString()) : false;

    res.status(200).json({
      success: true,
      event: eObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving event' });
  }
};

// @desc    Create event (Admin / Leads)
// @route   POST /api/events
// @access  Private (Admin or verified)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      date,
      endDate,
      venue,
      organizer,
      registrationLink
    } = req.body;

    let bannerImage = req.body.bannerImage || '';
    if (req.file) {
      bannerImage = `/uploads/${req.file.filename}`;
    }

    if (!title || !description || !date || !venue || !organizer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Description, Date, Venue, and Organizer'
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      eventType: eventType || 'Workshop',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      venue: venue.trim(),
      organizer: organizer.trim(),
      bannerImage,
      registrationLink: registrationLink || '',
      createdBy: req.user._id
    });

    const populated = await Event.findById(event._id)
      .populate('createdBy', 'fullName usn department profilePicture');

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating event' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin or creator)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.file) {
      req.body.bannerImage = `/uploads/${req.file.filename}`;
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin or creator)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event' });
  }
};

// @desc    Toggle interested status for event
// @route   POST /api/events/:id/interest
// @access  Private
exports.toggleInterest = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const userIdStr = req.user._id.toString();
    const hasInterested = event.interestedStudents.some(id => id.toString() === userIdStr);

    if (hasInterested) {
      event.interestedStudents = event.interestedStudents.filter(id => id.toString() !== userIdStr);
    } else {
      event.interestedStudents.push(req.user._id);
    }

    await event.save();

    res.status(200).json({
      success: true,
      isInterested: !hasInterested,
      interestedCount: event.interestedStudents.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating interest' });
  }
};
