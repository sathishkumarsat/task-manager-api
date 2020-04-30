const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');//load auth middleware
const Task = require('../models/task');

//Create new task
router.post('/tasks', auth, async (req, res) => {

    //old -> const task = await Task(req.body);

    const task = new Task({ //our own object we are sending contains all req.body with owner property
        ...req.body,    //copies all properties from body over to this object
        owner: req.user._id  //no need provide it in req, it comes from auth
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});


//Get all tasks with filters -> /tasks?completed=true -> here true is a string
// -> /tasks?limit=10 - limit up to 10 results
// -> /tasks?skip=10 - skip first 10 results
// -> /tasks?sortBy=createdAt:desc(field:order) can use : or other special char
router.get('/tasks', auth, async (req, res) => {
    const match = {};    //declaring a variable for query along with url
    if (req.query.completed) {
        //Here req.query.completed value is string, but we need boolean, so do like below
        match.completed = req.query.completed === 'true';    //(req.completed.query === 'true') returns booelan true if matches or else false
    }

    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');  //Based on this we need to use the seperation symbol in query
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;    // like == sort : createdAt:-1
                    // = (parts[1] === 'desc') -> if true, then -1 ->if false, then 1  
    }
    try {
        await req.user.populate({
            path: 'tasks',
            //match: {completed: false} -> for fixed match
            match,  //or match:match -> short hand
            options: {
                //limit: 2 -> for fixed limit
                limit: parseInt(req.query.limit), //ex: to covert 10(string) from 'limit=10' to number

                //skip: 2 -> for fixed limit
                skip: parseInt(req.query.skip),
                //sort: {    //createdAt:-1//(here asc = 1, desc = -1)   //completed: -1 }
                sort    //or sort:sort -> short hand
            }

        }).execPopulate();
        res.send(req.user.tasks);

    } catch (e) {
        res.status(500).send();
    }
});


//Get specific task by id ->
//Search the tasks created by only logged in user
router.get('/tasks/:id', auth, async (req, res) => {
    const task_id = req.params.id;
    try {
        //const getTask = await Task.findById(task_id);
        const getTask = await Task.findOne({ _id: task_id, owner: req.user._id });//search tasks by task id & along with owner come from auth
        if (!getTask) {
            return res.status(404).send();//if owner not matched or task doesn't exist
        }
        res.status(200).send(getTask);
    } catch (e) {
        res.status(500).send();
    }
});





//Update task
router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        //const updateTask = await Task.findById(req.params.id);
        const updateTask = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!updateTask) {
            return res.status(404).send();
        }

        updates.forEach((update) => {
            updateTask[update] = req.body[update];
        });
        await updateTask.save();

        res.send(updateTask);
    } catch (e) {
        res.status(500).send(e);
    }
});


//Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const deleteTask = await Task.findByIdAndDelete(req.params.id);
        const deleteTask = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!deleteTask) {
            return res.status(404).send();
        }
        res.send(deleteTask);
    } catch (e) {
        res.status(500).send(e);
    }
});


module.exports = router;
