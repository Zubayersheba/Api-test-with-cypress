
const { it } = require("mocha")
//<referece types ="Cypress" />

let testMobile = "01755883515"
let testPassword = "14725"
let accounts_api_url = 'https://accounts.dev-sheba.xyz'
let jwtToken

describe('Login Test cases',() => {  

   it('Login successful',() => {
       
       cy.request({
          
           method : 'POST',
           url : accounts_api_url+'/api/v3/profile/login',
           //headers : {}
           body : {
               mobile : testMobile,
               password: testPassword
           }
           
       }).then((res) => {
           //cy.log(JSON.stringify(res.body.token));
           expect(res.status).to.eq(200);
           expect(res.body.code).to.eq(200);
           expect(res.body.message).to.eq("Successful");
           jwtToken = res.body.token 
           cy.log(jwtToken);

       })

   });

})



