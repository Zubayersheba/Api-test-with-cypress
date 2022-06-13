const { it } = require("mocha")
//<referece types ="Cypress" />

/*
Test case : Call bad debt api to clear due for a specific customer
Expected : If specific customer have due entry user's due will be cleared and balance will be 0 by 
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

        })
    });
    it('Create due entry and then call bad debt api. Expected : Due will be cleared and balance type will be cleared',()=>{
        cy.request({
            method : 'POST',
            url : api_url +'/v3/accounting/due-tracker/bad-debts',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                account_key : "cash",
                contact_id: contact_id,
                contact_type : "customer"
            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.body.message).to.eq("Successful");
        })

    })
    it('Create Deposit entry for customer', () => {

        cy.request({

            method: 'POST',
            url: api_url + '/v3/accounting/due-tracker/',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                amount: 10,
                source_type: "deposit",
                account_key: "cash",
                contact_type: "customer",
                contact_id: contact_id,
                entry_at: "2022-05-22 13:13:12"

            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.status).to.eq(201);

        })
    });

    it('Create deposit entry and then call bad debt api. Expected : Api response will be Balance is Already Positive, as user is unable to create bad debt when balance type is deposit',()=>{
        cy.request({
            method : 'POST',
            url : api_url +'/v3/accounting/due-tracker/bad-debts',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                account_key : "cash",
                contact_id: contact_id,
                contact_type : "customer"
            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.body.data).to.eq("Balance is Already Positive.");
        })

    })
    it('Call bad debt api when balance type is cleared. Expected : Api response will be Balance is Already Positive, as customer is unable to create bad debt when balance type is cleared',()=>{
        cy.request({
            method : 'POST',
            url : api_url +'/v3/accounting/due-tracker/bad-debts',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: {
                account_key : "cash",
                contact_id: contact_id,
                contact_type : "customer"
            }
        }).then((res) => {
            //cy.log(JSON.stringify(res.body));
            expect(res.body.data).to.eq("Balance is Already Positive.");
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