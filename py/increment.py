# Hack: string type that is always equal in not equal comparisons
class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False


# Our any instance wants to be a wildcard string
any = AnyType("*")

class IncrementNode:
    curr_value=None
    @classmethod
    def IS_CHANGED():
        return float('nan')  
  
            
    @classmethod
    def INPUT_TYPES(cls):  
        return {"required":{}}

    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("INT",)
    CATEGORY = "utils"
    FUNCTION = "get_value"
    
    def __init__(self):
        if IncrementNode.curr_value is None:
            IncrementNode.curr_value=0  
    
    def get_value(self):
        cur_value=IncrementNode.curr_value
        IncrementNode.curr_value+=1   
        return (cur_value, )


class Halt: 
    
    @classmethod
    def IS_CHANGED():
        return float('nan')      
    
    @classmethod
    def INPUT_TYPES(cls):  
        return {"required":{"source": (any, {})}}

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "utils"
    FUNCTION = "get_value"    
    OUTPUT_NODE = True
    def get_value(self,source):
        IncrementNode.curr_value=0   
        return ()

        
NODE_CLASS_MAPPINGS = {
    "Increment|pysssss": IncrementNode,
    "Halt|pysssss": Halt
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "Increment|pysssss": "Increment 🐍",
    "Halt": "Halt 🐍"
}