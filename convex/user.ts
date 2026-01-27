import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser=mutation({
    args:{
        name:v.string(),
        imageUrl:v.string(),
        email:v.string(),
        
    },
    handler:async(ctx,args)=>{
  //check if user already exists
  const user=await ctx.db.query("UserTable")
  .filter(q=>q.eq(q.field("email"),args.email))
  .collect();
    if(user.length===0){  
        const userData={
            name:args.name,
            imageUrl:args.imageUrl,
            email:args.email,
        }
    //if user doesn't exist, create new user
    const result=await ctx.db.insert('UserTable', userData)
    return await ctx.db.get(result)
    }
    return user[0]
        }
    
})