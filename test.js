function factoryFunc(){
   return{
      property : "cool property",
      win : function(candidate){console.log(`${candidate} you win.`);},
      lose : function(){console.log("your opponent lost");}
   }
}

factoryFunc().win('Hello');