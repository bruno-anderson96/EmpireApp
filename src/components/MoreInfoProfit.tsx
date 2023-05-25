import { SafeAreaView, View } from "react-native";
import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  NativeBaseProvider,
} from "native-base";
import { useEffect, useState } from "react";

interface Props {
  profitGeral: number;
  qtdSkins: number;
  qtdSoldSkins: number;
  Show: boolean;
  setShowMoreInfoProfit: (Show: boolean) => void;
}

export default function MoreInfoProfit({ profitGeral, qtdSkins, qtdSoldSkins, Show, setShowMoreInfoProfit }: Props) {

  return (
    <Modal isOpen={Show} onClose={() => setShowMoreInfoProfit(!Show)}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Profit</Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>{(profitGeral).toFixed(2)} coins</FormControl.Label>
            <FormControl.Label>
              {"$ " + (profitGeral / 1.628).toFixed(2)}
            </FormControl.Label>
            <FormControl.Label>
              Quantidade de skins compradas: {qtdSkins}
            </FormControl.Label>
            <FormControl.Label>
              Quantidade de skins vendidas: {qtdSoldSkins}
            </FormControl.Label>
          </FormControl>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
