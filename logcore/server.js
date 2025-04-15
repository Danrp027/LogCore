const express = require("express");
const cors = require("cors");
const app = express();
const estoqueRoutes = require("./routes/estoque");

app.use(cors());
app.use(express.json());
app.use("/api/estoque", estoqueRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
