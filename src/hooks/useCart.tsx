import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {

     const storagedCart = localStorage.getItem('@RocketShoes:cart'); // vai buscar os dados no local storege

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]; // manter a imutabilidade, updatedCart e o novo array de cart
      const productExists = updatedCart.find(product => product.id === productId); // verificar se a id iguais.
      
      const stock = await api.get(`/stock/${productId}`); // recer o id de todos os products.
      
      const stockAmount = stock.data.amount; // recebe a quantidade de cada product
      const currentAmount = productExists ? productExists.amount : 0; // se produto ezxistir ele pega a quantidade se nao é 0
      const amount = currentAmount + 1; // acrescenta mais 1 na quantidade que eu quero.

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if(productExists){
        productExists.amount = amount; // productExists.amount recebe a quantidade de produto que eu quero
      }else {
        const product = await api.get(`/products/${productId}`); // buscar na api

        const newProduct = {
          ...product.data, // retorna os dados ja existentens
          amount: 1, // acrescenta o amount
        }
        updatedCart.push(newProduct);
      }
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart)); 
      } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
       const updatedCart = [...cart];
       const productIndex = updatedCart.findIndex(product => product.id === productId);

       if(productIndex >= 0){
         updatedCart.splice(productIndex, 1); // apagr um item
         setCart(updatedCart);
         localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
       }else {
         throw Error();
       }
    } catch {
       toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // todo
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
