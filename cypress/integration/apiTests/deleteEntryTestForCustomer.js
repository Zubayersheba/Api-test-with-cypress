const { it } = require("mocha")
//<referece types ="Cypress" />

/*
Test case : Delete a specific entry for a specific customer
Expected : Entry will be deleted and statuscode will be 200
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
let entry_id

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

    it('Create contact and store customer id', () => {

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
            contact_id = res.body.customer.id //store customer id

        })
    });

    it('Create Due entry for customer', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "due",
                account_key: "due_sales_from_dt",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.status).to.eq(201);
            entry_id=res.body.data.id //store entry id

        })
    });
    it('Create due entry and then call entry delete api. Expected : Entry will be deleted.',()=>{
        cy.request({
            method : 'DELETE',
            url : api_url +'/v3/accounting/entries/' + entry_id,
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.body.message).to.eq("Successful");
        })

    })
          

    after('Delete the contact after each test case execution', () => {
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