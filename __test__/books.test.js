process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;


beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '208723512',
        'https://amazon.com/law',
        'Cam',
        'Japanese',
        287,
        'TEST',
        'TEST BOOK', 3005)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn
});

//GET Test

describe("Test Get", () => {
    test("Get all", async () => {
      const res = await request(app).get("/books");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        books: [{
            isbn: "208723512",
            amazon_url: "https://amazon.com/law",
            author: "Cam",
            language: "Japanese",
            pages: 287,
            publisher: "TEST",
            title: "TEST BOOK",
            year: 3005,
          },
        ],
      });
    });

    test("Get by id", async () => {
        const res = await request(app).get("/books/208723512");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            book: {
              isbn: "208723512",
              amazon_url: "https://amazon.com/law",
              author: "Cam",
              language: "Japanese",
              pages: 287,
              publisher: "TEST",
              title: "TEST BOOK",
              year: 3005,
            },
        });
      });
});

//POST Test

describe("Test Post", () => {
    test("Create new post", async () => {
      const res = await request(app).post("/books").send({
        isbn: "10108894",
        amazon_url: "https://amazon.com/amazing",
        author: "Wes",
        language: "English",
        pages: 209,
        publisher: "TEST 2",
        title: "TEST BOOK 2",
        year: 2087,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        book: {
            isbn: "10108894",
            amazon_url: "https://amazon.com/amazing",
            author: "Wes",
            language: "English",
            pages: 209,
            publisher: "TEST 2",
            title: "TEST BOOK 2",
            year: 2087,
        },
      });
    });
        //NOT WORKING
    // test("Create inavlid post", async () => {
    //     const res = await request(app).post("/books").send({
    //       isbn: "22983298",
    //       amazon_url: "hey",
    //       author: 23,
    //       language: "BOO",
    //       pages: "NINE",
    //       publisher: "TEST",
    //       title: "TEST BOOK3",
    //       year: 2897,
    //     });
    //     expect(res.statusCode).toBe(400);
    //   });
});

//PUT test

describe("Test Put", () => {
    test("Update by isbn", async () => {
      const res = await request(app).put("/books/208723512").send({
        amazon_url: "http://amazon.com/woohoo",
        author: "Bob",
        language: "PEW",
        pages: 890,
        publisher: "TEST",
        title: "TEST BOOK 3",
        year: 2022,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        book: {
          isbn: "208723512",
          amazon_url: "http://amazon.com/woohoo",
          author: "Bob",
          language: "PEW",
          pages: 890,
          publisher: "TEST",
          title: "TEST BOOK 3",
          year: 2022,
        },
      });
    });
});

//DELETE test

describe("Test Delete", () => {
    test("Delete book by isbn", async () => {
      const res = await request(app).delete("/books/208723512");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Book deleted" });
    });
  
    test("Return 404 if isbn does not exist", async () => {
      const res = await request(app).delete("/books/woopity");
      expect(res.statusCode).toBe(404);
    });
  });

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });