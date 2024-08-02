import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,sign,verify } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings:
    {
        DATABASE_URL: string
        JWT_SECRET: string
    }
}>();

userRouter.post('/signup',async (c) => {

    const body = await c.req.json();
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
    try 
    {
      const user = await prisma.user.create({
        data:
        {
          username: body.username,
          password: body.password,
          name: body.name 
        }
      })
      if(!user)
      {
        c.status(403);    //unauthorized
        return c.json({
          message: "Incorrect creds"
        });
      }  
      const jwt = await sign({
        id: user.id,
      },c.env.JWT_SECRET)
  
      return c.text(jwt);
    }
    catch(e)
    { 
      console.log(e);
      c.status(411);
      return c.text('Invalid'); 
    }
  })
  
  userRouter.post('/signin', (c) => {
    return c.text('Hello Hono!')
  })