
 // Pruebas de integración de las rutas /api/posts

 const { describe, test } = require("node:test");
 const assert = require("node:assert/strict");
 const request = require("supertest");
 const app = require("../../app");

 // Inicia sesión y devuelve el token (igual que la petición «Login» de Postman).
 const iniciarSesion = async (username, password) => {
   const respuesta = await request(app).post("/api/login").send({ username, password });
   return respuesta.body.token;
 };

 describe("GET /api/posts", () => {
   test("responde 200 con las 5 publicaciones iniciales", async () => {
     const respuesta = await request(app).get("/api/posts");
     assert.equal(respuesta.status, 200);
     assert.equal(respuesta.body.length, 5);
   });

   // 3: Completa esta prueba.
   test("filtra por usuario con ?userId=2", async () => {
     const respuesta = await request(app).get("/api/posts?userId=2");
     assert.equal(respuesta.status, 200);
     assert.deepEqual(respuesta.body.map((p) => p.id), [3, 4]);
   });

   // 3: Completa esta prueba.
   test("responde 404 si la publicación no existe", async () => {
     const respuesta = await request(app).get("/api/posts/999");
     assert.equal(respuesta.status, 404);
   });
 });

 describe("POST /api/posts", () => {
   // 3: Completa esta prueba.
   test("responde 401 sin token", async () => {
     const respuesta = await request(app)
       .post("/api/posts")
       .send({ title: "Prueba", body: "Sin token" });
     assert.equal(respuesta.status, 401);
   });

   // 3: Completa esta prueba.
   test("crea la publicación con el autor del token, no del body", async () => {
     const token = await iniciarSesion("ana", "ana-12345");
     const respuesta = await request(app)
       .post("/api/posts")
       .set("Authorization", `Bearer ${token}`)
       .send({ userId: 3, title: "Publicación de prueba", body: "Creada por una prueba" });

     assert.equal(respuesta.status, 201);
     assert.equal(respuesta.body.userId, 1);
   });

   // 3: Completa esta prueba.
   test("responde 400 si falta el title", async () => {
     const token = await iniciarSesion("ana", "ana-12345");
     const respuesta = await request(app)
       .post("/api/posts")
       .set("Authorization", `Bearer ${token}`)
       .send({ body: "Sin título" });

     assert.equal(respuesta.status, 400);
   });

   // 3: Completa esta prueba.
   test("responde 400 si el JSON está mal escrito", async () => {
     const token = await iniciarSesion("ana", "ana-12345");
     const respuesta = await request(app)
       .post("/api/posts")
       .set("Authorization", `Bearer ${token}`)
       .set("Content-Type", "application/json")
       .send('{ "title": "Hola", }');

     assert.equal(respuesta.status, 400);
   });
 });

 describe("PUT y DELETE /api/posts/:id", () => {
   // 3: Completa esta prueba.
   test("responde 403 si ana edita una publicación de carla", async () => {
     const token = await iniciarSesion("ana", "ana-12345");
     const respuesta = await request(app)
       .put("/api/posts/5")
       .set("Authorization", `Bearer ${token}`)
       .send({ title: "Modificado", body: "Prueba" });

     assert.equal(respuesta.status, 403);
   });

   // 3: Completa esta prueba.
   test("el autor puede eliminar su propia publicación", async () => {
     const token = await iniciarSesion("ana", "ana-12345");

     const creada = await request(app)
       .post("/api/posts")
       .set("Authorization", `Bearer ${token}`)
       .send({ title: "Temporal", body: "Para eliminar" });

     assert.equal(creada.status, 201);

     const respuesta = await request(app)
       .delete(`/api/posts/${creada.body.id}`)
       .set("Authorization", `Bearer ${token}`);

     assert.equal(respuesta.status, 204);
   });
 });
