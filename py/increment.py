# Hack: string type that is always equal in not equal comparisons
class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False


# Our any instance wants to be a wildcard string
any = AnyType("*")

class IncrementNode:
    curr_value={}
    @classmethod
    def IS_CHANGED():
        return float('nan')  
  
            
    @classmethod
    def INPUT_TYPES(cls):  
        return {"required":{"link_id":("INT",{})}
        }

    RETURN_TYPES = ("INT",)
    RETURN_NAMES = ("INT",)
    CATEGORY = "utils"
    FUNCTION = "get_value"    
   
    def get_value(self, link_id):
        if link_id not in IncrementNode.curr_value:
            IncrementNode.curr_value[link_id]=0 
        cur_value=IncrementNode.curr_value[link_id]
        IncrementNode.curr_value[link_id]+=1   
        return (cur_value, )


class Halt: 
    
    @classmethod
    def IS_CHANGED():
        return float('nan')      
    
    @classmethod
    def INPUT_TYPES(cls):  
        return {"required":{"source": (any, {})},"optional":{"link_id":("INT",{})}}

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "utils"
    FUNCTION = "get_value"    
    OUTPUT_NODE = True
    def get_value(self,source,link_id=None):
        if link_id is None:
            IncrementNode.curr_value={}
        elif link_id in IncrementNode.curr_value:
            del IncrementNode.curr_value[link_id]   
        return ()

        
NODE_CLASS_MAPPINGS = {
    "Increment|pysssss": IncrementNode,
    "Halt|pysssss": Halt
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "Increment|pysssss": "Increment 🐍",
    "Halt|pysssss": "Halt 🐍"
}