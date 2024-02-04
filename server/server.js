import express from "express"
import mysql from "mysql"
import cors from "cors"
import cookieParser from "cookie-parser"
import jwt, { decode }  from "jsonwebtoken"

const app=express();
const port = 3001;


app.use(cookieParser());
app.use(express.json());


app.use(cors(
    {

    origin: ["http://localhost:3000"],
    methods: ["POST","GET"],
    credentials: true
    }
    
));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '123456789', 
    database: 'sql_cine' 
  }); 


  const verifyUser=(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
      return res.json({Message: "necesitas logiarte ahora"})
    } else{
      jwt.verify(token,"nuestra-web-token-secrteo",(err,decoded)=>{
        if(err){
          return res.json({Message: "error de autenticacion"})
        } else{
          req.name=decoded.name;
          next();
        }
        
      })
    }
  }


  app.get('/',verifyUser,(req,res)=>{
    return res.json({Status: "exito", name:req.name})

  })





  app.post('/login',(req,res)=>{
    const sql = 'SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?';
    db.query(sql,[req.body.email, req.body.password],(err,data)=>{
        if(err) return res.json({Message: "server side error"});
        if (data.length > 0){
            const name=data[0].usuario;
            const token = jwt.sign({name}, "nuestra-web-token-secrteo", { expiresIn: '2m' });

            res.cookie('token', token);
            return res.json({Status: "exito"})

        } else{
            return res.json({Message: "no record exist"});
        }

    })
  })


  app.get('/logout',(req, res)=>{
    res.clearCookie('token');
    return res.json({Status: "exito"})
  })



  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
  