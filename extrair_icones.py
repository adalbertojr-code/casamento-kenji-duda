from PIL import Image
import numpy as np
import os

origem = 'assets/_origem/cartilha.webp'
destino = 'assets/arte/cartilha'
os.makedirs(destino, exist_ok=True)

im = Image.open(origem).convert('RGB')
w, h = im.size

faixas = [(333, 437), (499, 596), (650, 775), (854, 976), (1037, 1165)]
mapa = [
    ('presenca', 'silencio'),
    ('convite', 'fotografos'),
    ('pontual', 'bebida'),
    ('rosa', 'flash'),
    ('branco', 'abraco')
]

xs = {
    'E': (int(w * 0.005), int(w * 0.20)),
    'D': (int(w * 0.515), int(w * 0.715))
}

print(f'Imagem: {w}x{h}')
print('Processando icones com contraste maximo...')

for i, (topo, base) in enumerate(faixas):
    for lado, nome in (('E', mapa[i][0]), ('D', mapa[i][1])):
        x0, x1 = xs[lado]
        if nome == 'abraco':
            x1 = int(w * 0.667)

        rec = im.crop((x0, topo, x1, base)).convert('RGBA')
        arr = np.array(rec).astype(np.float32)

        lum = arr[:, :, :3].mean(axis=2)

        # fundo creme (~238) vira transparente; qualquer traço fica opaco
        alfa = np.clip((242 - lum) * 10.0, 0, 255)

        # escurece o traço mantendo o matiz: puxa a luminosidade para baixo
        rgb = arr[:, :, :3] / 255.0
        rgb = np.power(rgb, 1.55)          # escurece os meios-tons
        rgb = rgb * 0.86                    # derruba o brilho geral
        arr[:, :, :3] = np.clip(rgb * 255, 0, 255)
        arr[:, :, 3] = alfa

        out = Image.fromarray(arr.astype(np.uint8), 'RGBA')

        bb = out.getbbox()
        if bb:
            out = out.crop(bb)

        if out.height > 0 and out.width > 0:
            esc = 150 / out.height
            novo_w = max(1, round(out.width * esc))
            novo = out.resize((novo_w, 150), Image.LANCZOS)

            novo.save(f'{destino}/{nome}.png')
            novo.save(f'{destino}/{nome}.webp', quality=95)
            print(f'  OK: {nome} ({novo_w}x150)')
        else:
            print(f'  ERRO: {nome} - bbox vazio')

print('Concluido!')