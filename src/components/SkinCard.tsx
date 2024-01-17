import {
  Text,
  Center,
  Heading,
  extendTheme,
  VStack,
  Box,
  useToast,
  Modal,
  FormControl,
  Button,
  Input,
  Alert,
} from "native-base";
import { Alert as alertN } from 'react-native';
import { Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import ModalDropdown from "react-native-modal-dropdown";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { THEME } from "../theme";
import { useEffect, useState } from "react";
import { child, ref, update } from "firebase/database";
import db from "../banco/config";

export interface SkinCardProps {
  uid: string;
  id: string;
  name: string;
  wear: string;
  price: number;
  img: string;
  date: Date;
  day: number;
  itemPath: string;
  sellPrice: number;
  profit: number;
  active: boolean;
  priceBuff: number;
  priceBuffBo: number;
}
interface Props {
  data: SkinCardProps;
}

export default function SkinCard({ data }: Props) {
  const toast = useToast();

  const [selectedOption, setSelectedOption] = useState("");

  const handleDropdownSelect = (index: number, value: string) => {
    setSelectedOption(value);
  };

  const currencies = [
    "Coin",
    "Wax($)",
    "SP($)",
    "$",
  ];
  const [currency, setCurrency] = useState(currencies);

  // Função para executar quando o cartão for clicado
  const handlePress = () => {
    toast.show({
      title: "Informações da skin",
      description: `Nome: ${data.name} - Preço: ${data.price} coins, Desbloqueia daqui a : ${data.day} dia(s)`,
    });
  };

  const [showModal, setShowModal] = useState(false);
  //
  const [price, setPrice] = useState("");

  const [depositPrice, setDepositPrice] = useState("");

  const [sellSuggestPriceEmp, setSellSuggestPriceEmp] = useState(0);  //*1,628 *1,05  (5%)
  const [sellSuggestPriceWax, setSellSuggestPriceWax] = useState(0);  //1,17
  const [sellSuggestPriceSp, setSellSuggestPriceSp] = useState(0); //1,17

  const [cheapestEmpire, setCheapestEmpire] = useState(0);

  const [apiKey, setApiKey] = useState("");

  const [expectedProfit, setExpectedProfit] = useState("");

  function getSuggestPrices() {
    var priceEmp = parseFloat(((data.priceBuff * 1.628) * (1 + parseFloat(expectedProfit) / 100)).toFixed(2));
    var priceWax = parseFloat(((data.priceBuff) * 1.0911 * (1 + parseFloat(expectedProfit) / 100)).toFixed(2));
    var priceSp = parseFloat(((data.priceBuff) * 1.1084 * (1 + parseFloat(expectedProfit) / 100)).toFixed(2));

    setSellSuggestPriceEmp(priceEmp);
    setSellSuggestPriceWax(priceWax);
    setSellSuggestPriceSp(priceSp);
  }

  const handlePrice = (text: string) => setPrice(text);

  const handleDepositPrice = (text: string) => setDepositPrice(text);

  function adjustPrice() {
    var newPrice: string = '';

    if (selectedOption == "Coin") {
      newPrice = (parseFloat(price)).toFixed(2);
    }
    if (selectedOption == "Wax($)") {
      newPrice = (parseFloat(price) * 1.628 * 0.94 * 0.975).toFixed(2);
    }
    if (selectedOption == "SP($)") {
      newPrice = (parseFloat(price) * 1.628 * 0.95 * 0.95).toFixed(2);
    }
    if (selectedOption == "$") {
      newPrice = (parseFloat(price) * 1.628).toFixed(2);
    }
    console.log(newPrice);

    return newPrice;
  }

  function updatePriceItem() {
    var newPrice: string = adjustPrice();
    if (price != '') {
      try {
        var profit: number;
        profit = parseFloat(newPrice) - data.price;
        profit = parseFloat(profit.toFixed(2));
        update(child(db, data.itemPath), {
          sellPrice: newPrice,
          profit: profit,
        })
          .then(() => {
            alert("Data updated");
          })
          .catch((error) => {
            alert(error);
          });

      } catch {
      } finally {
        setShowModal(false);
      }
    } else {
      alert("Please, add a value...");
    }
  }

  function hideItem() {
    try {
      alertN.alert(
        'Confirm',
        'Delete skin?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // alert('Operation cancelled.');
            },
          },
          {
            text: 'Confirm',
            onPress: () => {
              update(child(db, data.itemPath), {
                active: false,
              })
                .then(() => {
                  alert('Skin deleted!');
                })
                .catch((error) => {
                  alert(error);
                });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
    }
  }

  function getCheapestEmpire(skin_name: string) {
    var skin = skin_name;
    if (skin.includes('StatTrak')) {
      skin = skin.replace('StatTrak™ ', 'stattrak ')
    }
    skin = skin.replaceAll(' ', '%20');

    console.log(skin);
    axios
      .get(
        'https://csgoempire.com/api/v2/trading/items?per_page=1&page=1&price_max_above=15&sort=asc&order=market_value&search=' + skin,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          maxBodyLength: Infinity
        }
      )
      .then((response) => {
        setCheapestEmpire(response.data.data[0].market_value / 100);
        //console.log(JSON.stringify(response.data.data[0].market_value));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function depositSkin(dPrice: string) {
    var convertPrice;
    if (dPrice != "") {
      convertPrice = parseFloat(parseFloat(dPrice).toFixed(2)) * 100;
    } else {
      convertPrice = sellSuggestPriceEmp * 100;
    }
    const depositData = {
      items: [
        {
          id: parseInt(data.id),
          coin_value: convertPrice,
        },
      ],
    };

    try {
      alertN.alert(
        'Confirm',
        'Deposit skin for ' + convertPrice / 100,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // alert('Operation cancelled.');
            },
          },
          {
            text: 'Confirm',
            onPress: () => {
              sendSkinToDeposit(depositData);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
    }

    function sendSkinToDeposit(depositData: {}) {
      axios
        .post('https://csgoempire.com/api/v2/trading/deposit', depositData, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          console.log(depositData);
          console.log(response.data);

          alert('Deposit successful')
        })
        .catch(error => {
          console.error(error);
          // Trate o erro adequadamente aqui
        });
    }
  }

  async function getSavedApiKey() {
    try {
      const savedApiKey = await AsyncStorage.getItem('apiKey');
      setApiKey(savedApiKey || ''); // caso não exista valor salvo, inicializa com uma string vazia
    } catch (error) {
      console.error(error);
    }
  }

  async function getExpectedProfit() {
    try {
      const savedExpectedProfit = await AsyncStorage.getItem('expectedProfit');
      setExpectedProfit(savedExpectedProfit || ''); // caso não exista valor salvo, inicializa com uma string vazia
    } catch (error) {
      console.error(error);
    }
  }

  function openCardDetails() {
    getSuggestPrices();
    setShowModal(true)
    getCheapestEmpire(data.name);
  }

  useEffect(() => {
    // Carrega os dados do banco de dados ao montar o componente
    if (apiKey == "") {
      getSavedApiKey();
    }
    if (expectedProfit == "") {
      getExpectedProfit();
    }
  }, []);

  return (
    <TouchableOpacity onPress={() => openCardDetails()} onLongPress={() => hideItem()}>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header mr={5}>{data.name}</Modal.Header>
          <Modal.Body>
            <Box flexDir={"row"}>
              <Text alignSelf={"center"}>Price Buff: </Text>
              <Text alignSelf={"center"}>$ {data.priceBuff} </Text>
            </Box>
            <Box flexDir={"row"}>
              <Text alignSelf={"center"}>Price Buff Buy Order: </Text>
              <Text alignSelf={"center"}>$ {data.priceBuffBo} </Text>
            </Box>
            <Box flexDir={"row"} mb={2}>
              <Text alignSelf={"center"}>Empire cheapest: </Text>
              <Text alignSelf={"center"}>{cheapestEmpire} coins</Text>
            </Box>
            <Box flexDir={"row"}>
              <Text alignSelf={"center"}>ShadowPay: $ {sellSuggestPriceSp}</Text>
            </Box>
            <Box flexDir={"row"} mb={2}>
              <Text alignSelf={"center"}>Waxpeer: $ {sellSuggestPriceWax}</Text>
            </Box>
            <Box flexDir={"row"} mb={2} width={"full"}>
              <Text alignSelf={"center"}>Suggest Price: </Text>
              <Text alignSelf={"center"}>{sellSuggestPriceEmp} coins  </Text>
            </Box>
            {(data.id == "" || data.day > 0) ? (
              <Text></Text>
            ) : (
              <Box flexDir={"row"} mb={2} width={"full"}>
                <Input
                  width={"65%"}
                  keyboardType="numeric"
                  value={depositPrice}
                  onChangeText={handleDepositPrice}
                />
                <Button
                  ml={"3"}
                  flexDir={"row"}
                  onPress={() => {
                    depositSkin(depositPrice);
                  }}>
                  Deposit
                </Button>
              </Box>
            )}

            <Box flexDir={"row"}>
              <Text alignSelf={"center"}>Currency: </Text>
              <ModalDropdown
                options={currencies}
                onSelect={handleDropdownSelect}
                dropdownStyle={{ width: 200, height: 200 }}
                dropdownTextStyle={{ fontSize: 20 }}
                textStyle={{ fontSize: 20, color: "#447CFA" }}
                defaultValue={"Coin"}
                saveScrollPosition={false}
              />
            </Box>
            <FormControl>
              <FormControl.Label>Sell price: </FormControl.Label>
              <Input
                keyboardType="numeric"
                value={price}
                placeholder={(data.sellPrice).toString()}
                onChangeText={handlePrice}
              />
            </FormControl>
            <Text paddingTop={1}>Profit : {data.profit} coins</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onPress={() => {
                  updatePriceItem();
                }}
              //Colocar código para editar item no firebase
              >
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      <Center py={3}>
        <Box alignItems="center" flex={1} >
          <Box
            bgColor={"blue.800"}
            maxW="250"
            minW="250"
            justifyContent={"center"}
            alignItems="center"
            p={3}
            shadow={3}
            roundedTop={"lg"}
          >
            <Text color={"white"}>{data.name}</Text>
          </Box>
          <Box
            maxW="250"
            minW="250"
            alignItems="center"
            borderTopColor="black"
            borderTopWidth={1}
          >
            <LinearGradient
              colors={["#0064F0", "#498FFF"]}
              start={[0, 0]}
              end={[1, 0]}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box>
                <Image
                  source={{
                    uri: data.img,
                  }}
                  style={{ resizeMode: "center", height: 125, width: 200 }}
                  alt="main icon"
                />
              </Box>
              <Box flexDir={"row"} width={"100%"} >
                <Box
                  width={"50%"}
                  flexDir={"row"}
                  alignItems={"center"}
                  paddingLeft={1}
                >
                  {data.profit <= 0 ? (
                    data.sellPrice > 0 ?
                      <>
                        <AntDesign name="arrowdown" size={14} color="#B21B0E" />
                        <Text
                          paddingBottom={1}
                          paddingLeft={1}
                          color={"#B21B0E"}
                          fontSize={"md"}
                          alignSelf={"flex-start"}
                        >
                          {data.profit} coins
                        </Text>
                      </>
                      :
                      <></>
                  ) : (
                    <>
                      <AntDesign name="arrowup" size={14} color="#3ACC31" />
                      <Text
                        paddingBottom={1}
                        paddingLeft={1}
                        color={"#3ACC31"}
                        fontSize={"md"}
                        alignSelf={"flex-start"}
                      >
                        {data.profit} coins
                      </Text>
                    </>
                  )}
                </Box>
                <Box width={"50%"} >
                  {data.day <= 0 ? (
                    <Text></Text>
                  ) : (
                    <Text
                      p={2}
                      color={"#F02202"}
                      fontSize={"md"}
                      alignSelf={"flex-end"}
                    >
                      {data.day}d
                    </Text>
                  )}
                </Box>
              </Box>
            </LinearGradient>

            <Box
              bgColor={"blue.800"}
              p={3}
              flexDirection={"row"}
              borderColor="black"
              borderTopWidth={1}
              roundedBottom={"lg"}
            >
              <Box
                width="50%"
                alignItems="flex-start"
                borderRightColor="black"
                borderRightWidth={1}
              >
                <Text color={"yellow.500"} fontSize="md" alignSelf="center">
                  Coins
                </Text>
                <Text color={"white"} alignSelf="center">
                  {data.price}
                </Text>
              </Box>
              <Box width="50%" alignItems="flex-end">
                <Text color={"green.500"} fontSize="lg" alignSelf="center">
                  $
                </Text>
                <Text color={"white"} alignSelf="center">
                  {(data.price / 1.628).toFixed(2)}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Center>
    </TouchableOpacity>
  );
}
