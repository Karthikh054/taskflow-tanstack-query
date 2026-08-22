const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {search="", status="all"} = req.query;

    const filter = {};

    if(search.trim()){
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if(status === "completed"){
      filter.completed = true;
    }

    if(status === "active"){
      filter.completed = false;
    }

    const todo = await Todo.find(filter).sort({ created: -1 });

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is Required",
      });
    }

    const todo = await Todo.create({
      title: title.trim(),
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create",
    });
  }
});

router.put("/:id", async(req, res) => {
    try{
        const {id} = req.params;
        const {title, completed} = req.body;

        const todo = await Todo.findByIdAndUpdate(
            id,
            {
                title,
                completed
            },
            {
                new:true,
                runValidators: true
            }
        );
        if(!todo){
            return res.status(404).json({
                message: "Todo not found"
            });
        }
        res.status(200).json(todo);

    }catch(error){
        res.status(500).json({
            message: "Failed to update"
        });
    }
});

router.delete("/:id", async (req,res) => {
    try{
        const {id} = req.params;
        const todo = await Todo.findByIdAndDelete(id);
        if(!todo){
          return res.status(404).json({
                message : "Todo not Found"
            });
        }

        res.status(200).json({
            message : "Todo deleted successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message : "Failed to Delete"
        })
    }
});

module.exports = router;
