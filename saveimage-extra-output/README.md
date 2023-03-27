Allows adding widget values to filenames  
Search and replace is done in the format `%node.widgetname%`  
where `node` is a node S&R property name or a node title  
e.g. to output the model name: `%CheckpointLoaderSimple.ckpt_name%`  

To allow for shorter names or duplicates, you can either use the change node title and use that or right click any node -> Properties -> Node name for S&R  
And set that to a simpler thing, e.g. ckpt