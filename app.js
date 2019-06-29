var bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    methodOverride  = require('method-override'),
    expressSanitizer= require('express-sanitizer'),
    express         = require('express'),
    app             = express();

//App config
mongoose.connect("mongodb://localhost/restfulAppDB");
app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"));
//app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method")); // POST -> PUT,DELETE override
app.use(expressSanitizer()); // security -> script -> create,update

/* Yemek Field'leri
    -baslik
    -resim url
    -govde
    -olusturma zamani */

//Yemek Mongoose/Model
var yemekSchema = new mongoose.Schema({
    baslik:String,
    resim:String,
    govde:String,
    olusturmaZamani:{type:Date, default:Date.now}
});
var Yemek = mongoose.model("Yemek", yemekSchema);

//Ornek Yemek Olusturma
/* Yemek.create({
    baslik:"Kuru Fasulye",
    resim:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kuru_fasulye.jpg/320px-Kuru_fasulye.jpg",
    govde:"Lorem ipsum dolor sit amet, pro id audiam prompta officiis, fugit munere accusata no nam, rebum option sea ne."
}); */


//landing
app.get("/", (req, res) => {
    //res.render("home");
    res.redirect("/yemekler");
});

// ============================================ RESTful Routes ============================================
/* 
get     -> index route          -> /yemekler
get     -> new route            -> /yemekler/yeni
post    -> create route         -> /yemekler
get     -> show route           -> /yemekler/:id
get     -> edit route           -> /yemekler/:id/edit
put     -> update route         -> /yemekler/:id
delete  -> delete route         -> /yemekler/:id
 */


//Index Route
app.get("/yemekler", (req, res)=>{
    Yemek.find({}, (err, yemekler)=>{
        if(err){
            console.log(err);
        } else {
            res.render("index", {yemekler:yemekler});
        }
    });
});

//New Route
app.get("/yemekler/yeni", (req, res)=>{
    res.render("new");
});

//Create Route
app.post("/yemekler", (req, res)=>{
    req.body.yemek.govde = req.sanitize(req.body.yemek.govde);
    Yemek.create(req.body.yemek,(err, yeniYemek)=>{
        if(err){
            console.log(err);
            res.redirect("/new");
        } else {
            res.redirect("/yemekler");
        }
    });
});

//Show Route
app.get("/yemekler/:id", (req, res)=>{
    Yemek.findById(req.params.id, (err, bulunanYemek)=>{
        if(err){
            res.redirect("/yemekler")
        } else {
            res.render("show", {yemek: bulunanYemek});
        }
    });
});

//Edit Route
app.get("/yemekler/:id/edit", (req, res)=>{
    Yemek.findById(req.params.id, (err, bulunanYemek)=>{
        if(err){   
            res.redirect("/yemekler");
        } else {
            res.render("edit", { yemek : bulunanYemek });
        }
    });
    
});

//Update Route
app.put("/yemekler/:id", (req,res)=>{
    req.body.yemek.govde = req.sanitize(req.body.yemek.govde);
    Yemek.findByIdAndUpdate(req.params.id, req.body.yemek, (err, guncellenmisYemek)=>{
        if(err){
            res.redirect("/yemekler");
        } else {
            res.redirect("/yemekler/"+req.params.id);
        }
    });
});

//Delete Route
app.delete("/yemekler/:id", (req, res)=>{
    Yemek.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            console.log(err)
            res.redirect("/yemekler");
        } else {
            res.redirect("/yemekler");
        }
    });
});

//Server Config.
var server = app.listen(3000,function(err){
    if(err){
        console.log(err);
    } else {
        console.log('App Started. Port Number: %d',server.address().port)
    }
});