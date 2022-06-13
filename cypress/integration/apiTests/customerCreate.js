const { it } = require("mocha")
//<referece types ="Cypress" />

/*
Test case : Create contact and check for the given name and mobile numbers are same in response
Expected : Given input customer name : zubayer and number : +8801755883617 in response these data will be returned in api response after contact creation
*/

//Data set for create contact//
let contactMobile = (Cypress.env('contact_Mobile'))
let contactName = (Cypress.env('contact_Name'))
let api_url = (Cypress.env('api_url'))

//Data set for login//
let account_api_url = (Cypress.env('accounts_api_url'))
let testMobile = (Cypress.env('test_Mobile'))
let testPassword = (Cypress.env('test_Password'))
let jwtToken
let contact_id

describe('Create contact', () => {

    before('Login with pre-registered user and store jwtToken to create contact', () => {
        cy.request({

            method: 'POST',
            url: account_api_url + '/api/v3/profile/login',
            //headers : {}
            body: {
                mobile: testMobile,
                password: testPassword,
                created_from: "due_tracker"
            }

        }).then((res) => {
            jwtToken = res.body.token;  //store jwtToken  
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
            expect(res.status).to.eq(200);
            //cy.log(JSON.stringify(res.body.customer.mobile));
            contact_id = res.body.customer.id //store customer id

        })
    });
    
    it('Create contact and check customer mobile number and name', () => {

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
            expect(res.body.customer.name).to.eq(contactName);
            expect(res.body.customer.mobile).to.eq(contactMobile);
            //cy.log(JSON.stringify(res.body.customer.mobile));
            contact_id = res.body.customer.id

        })
    });

    afterEach('Delete the contact after each test case execution', () => {
        cy.request({

            method: 'DELETE',
            url: api_url + '/pos/v1/customers/' + contact_id,
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }

        }).then((res) => {
            expect(res.status).to.eq(200);


        })


    });


})