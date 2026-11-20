from PIL import Image
import numpy as np
import os

# Caminhos
origem = 'assets/_origem/cartilha.webp'
destino = 'assets/arte/cartilha'
os.makedirs(destino, exist_ok=True)

im = Image.open(origem).convert('RGB')
w, h = im.size

# Coordenadas das faixas (topo, base) - ajustadas para pegar apenas os ícones
faixas = [(333, 437), (499, 596), (650, 775), (854, 976), (1037, 1165)]

# Mapeamento dos nomes dos arquivos
mapa = [
 ('presenca', 'silencio'),
 ('convite', 'fotografos'),
 ('pontual', 'bebida'),
 ('rosa', 'flash'),
 ('branco', 'abraco')
]

# Coordenadas X para Esquerda e Direita
xs = {
 'E': (int(w * 0.005), int(w * 0.20)),
 'D': (int(w * 0.515), int(w * 0.715))
}

print(f'Imagem original: {w}x{h}')
print('Processando ícones com contraste MÁXIMO...')

for i, (topo, base) in enumerate(faixas):
 for lado, nome in (('E', mapa[i][0]), ('D', mapa[i][1])):
 x0, x1 = xs[lado]

 # Ajuste especial para o último ícone da direita (abraço) que pode ser mais largo
 if nome == 'abraco':
 x1 = int(w * 0.667)

 rec = im.crop((x0, topo, x1, base)).convert('RGBA')
 arr = np.array(rec).astype(np.float32)

 # Calcular luminosidade média dos canais RGB
 lum = arr[:, :, :3].mean(axis=2)

 # Criar alpha baseado na diferença com o fundo claro (~238)
 # Quanto mais escuro o pixel original, mais opaco ele fica
 # Multiplicador alto para garantir que apenas os traços fiquem visíveis
 alfa = np.clip((240 - lum) * 10.0, 0, 255)

 # Escurecer drasticamente os pixels para ficar quase preto/marrom escuro (#2A1A15)
 # Subtrair um valor base alto e multiplicar para aumentar o contraste
 rgb = arr[:, :, :3]
 rgb = (rgb - 50) * 5.0 + 20
 arr[:, :, :3] = np.clip(rgb, 0, 255)
 arr[:, :, 3] = alfa

 out = Image.fromarray(arr.astype(np.uint8), 'RGBA')

 # Recortar transparências
 bb = out.getbbox()
 if bb:
 out = out.crop(bb)

 # Redimensionar para altura fixa de 150px mantendo proporção
 if out.height > 0 and out.width > 0:
 esc = 150 / out.height
 novo_w = max(1, round(out.width * esc))
 novo = out.resize((novo_w, 150), Image.LANCZOS)

 # Salvar em PNG e WebP
 novo.save(f'{destino}/{nome}.png')
 novo.save(f'{destino}/{nome}.webp', quality=95)
 print(f' OK: {nome} ({novo_w}x150)')
 else:
 print(f' ERRO: {nome} - bbox vazio')

print('Concluído! Ícones salvos em assets/arte/cartilha/')