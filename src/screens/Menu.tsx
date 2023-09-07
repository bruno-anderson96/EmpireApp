import {
  Text,
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Box,
  useToast,
  FormControl,
  Input,
  Modal,
  Button,
} from "native-base";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../theme";
import { FlatList } from "native-base";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getDatabase, get, ref, child } from "firebase/database";
import { AntDesign } from "@expo/vector-icons";
import { EvilIcons } from '@expo/vector-icons';
import ModalDropdown from "react-native-modal-dropdown";
import stringSimilarity, { findBestMatch } from "string-similarity";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Background } from "../components/Background";
import SkinCard from "../components/SkinCard";
import { SkinCardProps } from "../components/SkinCard";
import { Loading } from "../components/Loading";

import db from "../banco/config.js";
import { TouchableOpacity } from "react-native";
import MoreInfoProfit from "../components/MoreInfoProfit";

export interface UserParams {
  userName: string;
}

export default function Menu() {
  // Estado para armazenar as skins
  const [skins, setSkins] = useState<SkinCardProps[]>([]);
  // Estado para armazenar as skins com filtros
  const [filteredSkins, setFilteredSkins] = useState<SkinCardProps[]>([]);
  // Estado para armazenar o valor total das skins
  const [valorInv, setValorInv] = useState<number>(0);
  // Adicione um estado de carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Mostrar itens em bloqueio
  const [tradeLocked, setTradeLocked] = useState<boolean>(true);
  // Mostrar itens vendidos
  const [soldItens, setSoldItens] = useState<boolean>(true);
  // Pegar o usuário da tela anterior
  const route = useRoute();
  const user = route.params as UserParams;
  //Abrir filtros das skins
  const [showModal, setShowModal] = useState(false);
  //Abrir configuração de API
  const [showModalApiKey, setModalApikey] = useState(false);
  //Pegar profit total de todos os itens filtrados
  const [profitGeral, setProfitGeral] = useState(0);
  const [qtdSkins, setQtdSkins] = useState(0);
  const [qtdSoldSkins, setQtdSoldSkins] = useState(0);
  const [showMoreInfoProfit, setShowMoreInfoProfit] = useState(false);

  //Para os filtros
  const ordens = [
    "Date asc",
    "Date desc",
    "Name asc",
    "Name desc",
    "Price asc",
    "Price desc",
  ];
  const [ftOrdem, setFtOrdem] = useState(ordens);
  const [selectedOption, setSelectedOption] = useState("");
  const [skinName, setSkinName] = useState("");

  const [apiKey, setApiKey] = useState("");

  const [expectedProfit, setExpectedProfit] = useState("");

  const handleSkinName = (text: string) => setSkinName(text);

  const handleDropdownSelect = (index: number, value: string) => {
    setSelectedOption(value);
  };

  function handleSort(option: string) {
    if (option == "Date asc") {
      setFilteredSkins(
        skins.sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    }
    if (option == "Date desc") {
      setFilteredSkins(
        skins.sort((a, b) => b.date.getTime() - a.date.getTime())
      );
    }
    if (option === "Name asc") {
      setFilteredSkins(skins.sort((a, b) => a.name.localeCompare(b.name)));
    }
    if (option == "Name desc") {
      setFilteredSkins(skins.sort((a, b) => b.name.localeCompare(a.name)));
    }
    if (option == "Price desc") {
      setFilteredSkins(skins.sort((a, b) => b.price - a.price));
    }
    if (option == "Price asc") {
      setFilteredSkins(skins.sort((a, b) => a.price - b.price));
    }
  }

  function handleSaveFilter() {
    setShowModal(false);
    setFilteredSkins(skins);

    if (skinName != "") {
      const threshold = 0.25;
      const lowercaseName = skinName.toLowerCase();
      const splitedString = lowercaseName.split(" ");
      const filteredSkins = skins
        .filter((skin) =>
          splitedString.every((word) => skin.name.toLowerCase().includes(word))
        )
        .sort(
          (skinA, skinB) =>
            skinB.name.toLowerCase().localeCompare(lowercaseName) -
            skinA.name.toLowerCase().localeCompare(lowercaseName)
        );
      const bestMatch = filteredSkins[0];
      if (
        bestMatch &&
        bestMatch.name.localeCompare(lowercaseName) <= threshold
      ) {
        // setFilteredSkins([bestMatch]);
        setFilteredSkins(filteredSkins);
      } else {
        setFilteredSkins(filteredSkins);
      }
    } else {
      handleSort(selectedOption);
    }
  }

  function handleResetFilter() {
    setShowModal(false);
    setFilteredSkins(skins);
  }

  function resetFilters() {
    setSoldItens(true);
    setTradeLocked(true)
  }

  function toggleTradeLocked() {
    if (tradeLocked == true) {
      setFilteredSkins(skins.filter((skin) => skin.day <= 0));
    } else {
      if (soldItens == true) {
        setFilteredSkins(skins);
      } else {
        setFilteredSkins(skins.filter((skin) => skin.sellPrice <= 0));
      }
    }
    setTradeLocked(!tradeLocked);
    setIsLoading(true);
  }

  function toggleSoldItens() {
    if (soldItens == true) {
      setFilteredSkins(skins.filter((skin) => skin.sellPrice <= 0));
    } else {
      if (tradeLocked == true) {
        setFilteredSkins(skins);
      } else {
        setFilteredSkins(skins.filter((skin) => skin.day <= 0));
      }
    }
    setSoldItens(!soldItens);
    setIsLoading(true);
  }

  function updateItens() {
    if (!isLoading) {
      //Para o update
      resetFilters();
      setIsLoading(true);
      setFilteredSkins([]);
    }
  }

  function carregaItens() {
    // Definindo o tipo para arSkins (um array de objetos SkinData)
    const arSkins: SkinCardProps[] = [];

    try {
      get(child(db, `${user.userName}/itens`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach(function (childSnapshot) {
              var childKey = childSnapshot.key;
              var childData = childSnapshot;
              if (
                childSnapshot.key !== null &&
                childSnapshot.key !== undefined
              ) {
                var active = childData.child("active").val() ?? true;

                if (active !== false) {

                  const timeElapsed = childData.child("date").val();
                  const today = new Date(timeElapsed);
                  today.setDate(today.getDate() + 8);
                  var dAtual = new Date();
                  var day;
                  day = ((today - dAtual) / (1000 * 60 * 60 * 24)).toFixed(0);
                  var profit = childData.child("profit").val() ?? 0;
                  var sellPrice = childData.child("sellPrice").val() ?? '';
                  var priceBuff = childData.child("priceBuff").val() ?? 0;

                  arSkins.push({
                    uid: childKey ?? "",
                    id: childData.child("id").val() ?? "",
                    name: childData.child("nome").val() ?? "",
                    img: childData.child("img").val() ?? "",
                    price: parseFloat(childData.child("price").val()) ?? 0,
                    date: new Date(timeElapsed) ?? 0,
                    day: day ?? 0,
                    itemPath: `${user.userName}/itens/${childKey}`,
                    sellPrice: sellPrice,
                    profit: profit,
                    priceBuff: priceBuff ?? 0,
                    priceBuffBo: childData.child("priceBuffBo").val() ?? 0,
                  });
                }
              }
            });
            // Define o estado das skins com o array de skins
            setSkins(arSkins);

            if (filteredSkins.length == 0) {
              setFilteredSkins(arSkins);
            }
            // Calcula o valor total das skins
            var valor_inv = arSkins.reduce((total, elemento) => {
              return (total += parseFloat(elemento.price));
            }, 0);

            //Pegando informações adicionais
            var profitGeral = arSkins.reduce((total, elemento) => {
              return elemento?.sellPrice > 0
                ? (total += parseFloat(elemento?.profit))
                : total;
            }, 0);

            var qtdSkins = arSkins.length;

            var qtdSoldSkins = arSkins.filter((skin) => skin.sellPrice > 0);
            setQtdSoldSkins(qtdSoldSkins.length);

            // Define o estado do valor total das skins
            setValorInv(valor_inv);

            setProfitGeral(profitGeral);
            setQtdSkins(qtdSkins);

            // Altere o estado do carregamento para "false" após carregar todos os dados
            setIsLoading(false);
          } else {
            console.log("No data available");
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log(error);
      // Tratamento de erro aqui (por exemplo, exibir uma mensagem de erro)
    }
  }

  function showMoreInfoProfitModal() {
    setShowMoreInfoProfit(!showMoreInfoProfit);
  }

  const handleSetApiKey = (text: string) => setApiKey(text);

  const handleExpectedProfit = (text: string) => setExpectedProfit(text);

  async function saveApiKey() {
    try {
      await AsyncStorage.setItem('apiKey', apiKey);
    } catch (error) {
      console.error(error);
    }

    try {
      await AsyncStorage.setItem('expectedProfit', expectedProfit);
    } catch (error) {
      console.error(error);

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

  const renderSkinCard = ({ item }) => {
    // Implemente o componente SkinCard aqui
    return <SkinCard data={item} />;
  };

  const renderEmptyListComponent = () => {
    return <Text color={"yellow.400"}>Não há itens ainda.</Text>;
  };

  useEffect(() => {
    // Carrega os dados do banco de dados ao montar o componente
    carregaItens();
    if (apiKey == "") {
      getSavedApiKey();
    }
    if (expectedProfit == "") {
      getExpectedProfit();
    }
  }, [filteredSkins]);

  return (
    <NativeBaseProvider>
      {/* Componente de fundo */}
      <Background>
        <Modal isOpen={showModalApiKey} onClose={() => setModalApikey(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.Header>Personal account config</Modal.Header>
            <Modal.Body>
              <FormControl>
                <Box>
                  <FormControl.Label>Api Key: </FormControl.Label>
                  <Input
                    keyboardType="default"
                    value={apiKey}
                    onChangeText={handleSetApiKey}
                  />
                </Box>
                <Box flexDir={"row"} mt={"2"}>
                  <FormControl.Label alignSelf={"center"}>Profit(%):  </FormControl.Label>
                  <Input
                    keyboardType="default"
                    value={expectedProfit}
                    onChangeText={handleExpectedProfit}
                    width={"40%"}
                  />
                </Box>
              </FormControl>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button onPress={() => saveApiKey()}>Save</Button>
              </Button.Group>
            </Modal.Footer>
            <Modal.CloseButton />
          </Modal.Content>
        </Modal>
        <MoreInfoProfit profitGeral={profitGeral} qtdSkins={qtdSkins} qtdSoldSkins={qtdSoldSkins} Show={showMoreInfoProfit} setShowMoreInfoProfit={setShowMoreInfoProfit} />
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Filters</Modal.Header>
            <Modal.Body>
              <FormControl>
                <FormControl.Label>Skin name: </FormControl.Label>
                <Input
                  keyboardType="default"
                  value={skinName}
                  onChangeText={handleSkinName}
                />
              </FormControl>
              <Box mt={2}>
                <ModalDropdown
                  options={ftOrdem}
                  onSelect={handleDropdownSelect}
                  dropdownStyle={{ width: 250, height: 300 }}
                  dropdownTextStyle={{ fontSize: 20 }}
                  textStyle={{ fontSize: 20, color: "#447CFA" }}
                  defaultValue={"Select a filter... "}
                  saveScrollPosition={false}
                />
              </Box>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button onPress={() => handleResetFilter()}>Reset</Button>
                <Button onPress={() => handleSaveFilter()}>Save</Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
        <SafeAreaView>
          <Box p="3" justifyContent="center" width="100%">
            <LinearGradient
              colors={["#73C2FA", "#4F2FD6"]}
              start={[0, 0]}
              end={[1, 0]}
              style={{
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <Box width="full" justifyContent="center" alignItems="center" flexDirection="row">
                <Text color="white" fontSize="xl" fontWeight="bold" alignSelf="center">
                  My Withdrawals
                </Text>
                <Box position="absolute" right={0}>
                  <TouchableOpacity onPress={() => setModalApikey(true)}>
                    <EvilIcons name="gear" size={28} color="white" />
                  </TouchableOpacity>
                </Box>
              </Box>
              <Text color="white" fontSize="lg" paddingTop={5}>
                Total: {valorInv.toFixed(2)} Coins
              </Text>

              <Box flexDir={"row"} width={"100%"}>
                <Box width={"8%"}>
                  <TouchableOpacity onPress={() => updateItens()}>
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <AntDesign name="reload1" size={20} color="#F7FBF9" />
                    )}
                  </TouchableOpacity>
                </Box>
                <Box alignItems={"center"} width={"84%"}>
                  <Text color={"white"} fontSize="lg">
                    ${(valorInv / 1.628).toFixed(2)}
                  </Text>
                </Box>
                <Box width={"8%"}>
                  <TouchableOpacity onPress={() => showMoreInfoProfitModal()}>
                    <AntDesign name="infocirlceo" size={24} color="#F7FBF9" />
                  </TouchableOpacity>
                </Box>
              </Box>
            </LinearGradient>
          </Box>
        </SafeAreaView>
        <Center px={4} flex={1}>
          <VStack space={0} alignItems="center">
            <Box bgColor={"blueGray.700"} p={2} borderRadius={10}>
              <Box flexDirection={"row"}>
                <Text alignSelf={"center"} color={"white"}>
                  Show trade locked itens
                </Text>
                <Switch
                  isChecked={tradeLocked}
                  colorScheme="primary"
                  onToggle={toggleTradeLocked}
                />
              </Box>
              <Box flexDirection={"row"}>
                <Box flexDirection={"row"}>
                  <Text alignSelf={"center"} color={"white"}>
                    Show sold itens
                  </Text>
                  <Switch
                    isChecked={soldItens}
                    colorScheme="primary"
                    onToggle={toggleSoldItens}
                  />
                </Box>

                <Box width={"15%"} justifyContent={"center"} marginLeft={5}>
                  <TouchableOpacity onPress={() => setShowModal(true)}>
                    <AntDesign name="filter" size={26} color="#C2CEDE" />
                  </TouchableOpacity>
                </Box>
              </Box>
            </Box>
            {/* Seção de cartões de skin */}
            {isLoading && filteredSkins.length === 0 ? ( // Exiba o componente de carregamento enquanto "isLoading" for verdadeiro e a lista de skins estiver vazia
              <Loading />
            ) : (
              <HStack
                space={2}
                justifyContent={"center"}
                width={"100%"}
                flex={1}
                py={1}
              >
                <FlatList
                  data={filteredSkins}
                  keyExtractor={(item) => item.uid}
                  renderItem={renderSkinCard}
                  ListEmptyComponent={renderEmptyListComponent}
                  initialNumToRender={10}
                />
              </HStack>
            )}
          </VStack>
        </Center>
      </Background >
    </NativeBaseProvider >
  );
}
