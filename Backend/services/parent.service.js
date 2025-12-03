const parentModel = require('../models/parent.model');

module.exports.createParent = async ({
    firstname, lastname, email, password
}) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required');
    }
    const parent = parentModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password
    })

    return parent;
}

module.exports.addChildToParent = async (parentId, childId) => {
    const parent = await parentModel.findByIdAndUpdate(
        parentId,
        { $addToSet: { children: childId } },
        { new: true }
    ).populate('children');
    
    return parent;
}

module.exports.removeChildFromParent = async (parentId, childId) => {
    // if not the par of child, throw error
    const child = await parentModel.findOne({ children: childId });
    if (!child) {
        console.log("removechild not possible as child not found in list at parent.service.js");
        throw new Error('Child not found in parent\'s children list');
    };

    const parent = await parentModel.findByIdAndUpdate(
        parentId,
        { $pull: { children: childId } },
        { new: true }
    ).populate('children');
    
    return parent;
}

module.exports.addNotification = async (parentId, notificationData) => {
    const parent = await parentModel.findByIdAndUpdate(
        parentId,
        { $push: { notifications: notificationData } },
        { new: true }
    ).populate('notifications.userId').populate('notifications.captainId');
    console.log("add notification called at parent.services.js");
    return parent;
}

module.exports.getParentNotifications = async (parentId) => {
    const parent = await parentModel.findById(parentId)
        .populate('notifications.userId')
        .populate('notifications.captainId');
    console.loug("getparnotifi called at parent.service.js");
    return parent.notifications;
}

module.exports.markNotificationsAsRead = async (parentId, notificationId) => {
    const parent = await parentModel.findByIdAndUpdate(
        parentId,
        { $set: { 'notifications.$[elem].read': true } },
        { 
            new: true,
            arrayFilters: [{ 'elem._id': notificationId }]
        }
    );
    
    return parent;
}