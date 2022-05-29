//import { jwtToken } from "../apiTests/Login";
const { it } = require("mocha")
//<referece types ="Cypress" />

let contactMobile = "01755883616"
let contactName = "zubayer"
let api_url = 'https://api.dev-sheba.xyz'
let account_api_url = 'https://accounts.dev-sheba.xyz'
let testMobile = "01755883515"
let testPassword = "14725"
let jwtToken
let contact_id
describe('Create contact', () => {
    
        before(()=>{
            cy.request({
    
                method: 'POST',
                url: account_api_url + '/api/v3/profile/login',
                //headers : {}
                body: {
                    mobile: testMobile,
                    password: testPassword
                }
    
            }).then((res) => {
                jwtToken = res.body.token;
                cy.log(jwtToken);
    
            })

        });

    it('Create contact and check success response', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/pos/v1/customers',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                mobile: contactMobile,
                name: contactName
            }
        }).then((res) => {

            cy.log(JSON.stringify(res.body.customer.id));
            //expect(res.status).to.eq(200);
            contact_id = res.body.customer.id

        })
    });

    after(()=> {
        cy.request({
    
            method: 'DELETE',
            url: api_url + '/pos/v1/customers/' + contact_id,
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }

        }).then((res) => {
            cy.log(JSON.stringify(res.body));
            

        })


    });


})