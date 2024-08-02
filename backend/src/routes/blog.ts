import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { Hono } from "hono";

export const blogRouter = new Hono<{
Bindings: 
  {
    DATABASE_URL: string,
    JWT_SECRET: string
  },
  Variables:
  {
    userId: string
  }
}>();

const prisma = new PrismaClient();

blogRouter.use("/*",async (c,next) => 
{   
    //extract the user id
    //pass it down to the routes
    const authHeader = c.req.header("authorization") || ""
    const user = await verify(authHeader,c.env.JWT_SECRET);

    if(user)
    {
        c.set("userId", user.id);
        next();
    }
    else 
    {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blog = await prisma.post.create({
    data:
    {
        title: body.title,
        content: body.content,
        authorId: "1"
    }
  })
    return c.json({
        id:blog.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
    
  const blog = await  prisma.post.update({
    where:
    {
        id: body.id
    },
    data:
    {
        title: body.title,
        content: body.content
    }
  })

  return c.json({
    id: blog.id
  })

})
  
blogRouter.get('/', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try 
  {
    const blog = prisma.post.findFirst({
        where: 
        {
            id: body.id 
        }
      })    
    
      return c.json({
        blog
      })
  }
  catch(err)
  {
    c.status(411);
    return c.json({
        message: "The request failed with error" + err
    })
  }

})

// TODO: Add Pagination 
blogRouter.get('/bulk',async (c) => {
  
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const blogs = await prisma.post.findMany()

  try 
  {
    return c.json(blogs);
  }
  catch(err)
  {
    c.status(411);
    return c.json({
        message: "Some error occured" + err
    })
  }
})