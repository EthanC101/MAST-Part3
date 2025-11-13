// App.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";


type Course = "Starter" | "Main" | "Dessert" | "Drink";

/**
 * MenuItem represents a dish on Christoffels menu.
 * - price is a number (important for averages)
 * - ingredients are used here as tags like "Beef", "Chicken", etc.
 */
type MenuItem = {
  id: string;
  name: string;
  description: string;
  ingredients: string[]; // tags for the dish (keeps parity with original)
  price: number; // store as number, not string
  course: Course;
};

/* ---------- Static tag options (used for quick selection) ---------- */
/* Kept as a const to mirror lecturer code style. These appear as chips. */
const DISH_TAG_OPTIONS = ["Beef", "Chicken", "Veggie", "Cheese"] as const;

/* ---------- App root ---------- */

export default function App() {
  // Keep a screen state that switches between the four major views.
  // Using the exact screen names you wanted: Home, Menu, Settings, Contact
  const [screen, setScreen] = useState<"Home" | "Menu" | "Settings" | "Contact">(
    "Home"
  );


  const [menu, setMenu] = useState<MenuItem[]>([]);

  const [filterCourse, setFilterCourse] = useState<Course | "All">("All");

  // Small derived value: how many dishes exist on the menu.
  const totalMenuItems = menu.length;

  /* ---------- Top icon/text nav component ---------- */

  const NavBar = () => (
    <View style={styles.nav}>
      <NavIcon
        icon="home"
        label="Home"
        active={screen === "Home"}
        onPress={() => setScreen("Home")}
      />
      <NavIcon
        icon="restaurant"
        label="Menu"
        active={screen === "Menu"}
        onPress={() => setScreen("Menu")}
      />
      <NavIcon
        icon="settings"
        label="Settings"
        active={screen === "Settings"}
        onPress={() => setScreen("Settings")}
      />
      <NavIcon
        icon="call"
        label="Contact"
        active={screen === "Contact"}
        onPress={() => setScreen("Contact")}
      />
    </View>
  );

  /* ---------- Main layout ---------- */

  return (
    <View style={styles.container}>
      <Header />
      <NavBar />
      <View style={{ flex: 1 }}>
        {screen === "Home" && (
          <HomeScreen
            menu={menu}
            totalMenuItems={totalMenuItems}
            onRemoveItem={(id) => setMenu((prev) => prev.filter((m) => m.id !== id))}
          />
        )}

        {screen === "Menu" && (
          // Menu screen contains the "Add Dish" functionality and list
          <MenuScreen
            onAdd={(item) => setMenu((prev) => [item, ...prev])}
            menu={menu}
            onRemoveItem={(id) => setMenu((prev) => prev.filter((m) => m.id !== id))}
          />
        )}

        {screen === "Settings" && (
          // Settings screen contains filtering controls (by course)
          <SettingsFilterScreen
            menu={menu}
            filterCourse={filterCourse}
            onChangeCourse={setFilterCourse}
          />
        )}

        {screen === "Contact" && (
          // Contact screen will show average prices by tag/ingredient
          <AverageByTagScreen menu={menu} />
        )}
      </View>
    </View>
  );
}

/* ---------- Header ---------- */

const Header = () => {
  return (
    <View style={styles.header}>
      {/* Left: Title */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Christoffels dine in</Text>
        <Text style={styles.subtitle}>Home • Menu • Settings • Contact</Text>
      </View>

      {/* Right: small auth buttons and chef logo */}
      <View style={{ alignItems: "flex-end" }}>
        <View style={styles.authRow}>
          <Pressable style={styles.loginPill}>
            <Text style={styles.loginText}>Log in</Text>
          </Pressable>
          <Pressable style={styles.signupPill}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
        </View>

        <Image
          source={require("./assets/chef_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

/* ---------- NavIcon component (kept similar to lecturer code) ---------- */

function NavIcon({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.navItem, active && styles.navItemActive]}>
      <Ionicons name={icon} size={20} style={{ opacity: active ? 1 : 0.8 }} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}


/* -- HOME SCREEN -- */
function HomeScreen({
  menu,
  totalMenuItems,
  onRemoveItem,
}: {
  menu: MenuItem[];
  totalMenuItems: number;
  onRemoveItem: (id: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* Stats row with the total count */}
      <View style={styles.statsRow}>
        <StatCard label="Menu items" value={String(totalMenuItems)} />
        <StatCard label="Tag options" value={String(DISH_TAG_OPTIONS.length)} />
      </View>

      {/* Hero: big chef illustration to the right like the screenshot */}
      <View style={styles.heroRow}>
        <View style={styles.heroLeft}>
          <View style={styles.bigGrayBox}>
            <Text style={styles.bigGrayText}>Welcome</Text>
          </View>

          <View style={[styles.bigGrayBox, { marginTop: 12 }]}>
            <Text style={styles.bigGrayText}>About Us</Text>
          </View>
        </View>

        <View style={styles.heroRight}>
          <Image
            source={require("./assets/chef_big.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* About content */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={styles.sectionHeading}>About Christoffels dine in</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <Image source={require("./assets/chef_logo.png")} style={styles.smallChefThumb} resizeMode="contain" />
          <Text style={styles.aboutText}>
            At Christoffels Dine In, we believe dining is more than just a meal — it's an experience.
            Rooted in tradition and elevated with innovation, our kitchen blends classic flavors with modern flair to bring you dishes that feel both familiar and fresh.
          </Text>
        </View>
      </View>

      {/* Footer: quick list of created menu items (keeps functionality visible) */}
      <View style={{ padding: 16 }}>
        <Text style={styles.sectionSubheading}>Latest dishes</Text>
        {menu.length === 0 ? (
          <View style={{ paddingVertical: 16 }}>
            <Text style={{ color: "#777" }}>No dishes yet. Add your first dish in the Menu screen.</Text>
          </View>
        ) : (
          <FlatList
            data={menu}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.smallCard}>
                <Text style={{ fontWeight: "700" }}>{item.name}</Text>
                <Text style={{ color: "#555", marginTop: 6 }}>{item.course}</Text>
                <Text style={{ marginTop: 6, fontWeight: "700" }}>R {item.price.toFixed(2)}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}


/* -- MENU SCREEN -- */


/**
 * MenuScreen contains the add-dish form (derived from AddItemScreen)
 * plus a list of dishes with delete functionality.
 * This preserves the logic for adding items, validating price as a number,
 * and clearing the form after a successful save.
 */
function MenuScreen({
  onAdd,
  menu,
  onRemoveItem,
}: {
  onAdd: (item: MenuItem) => void;
  menu: MenuItem[];
  onRemoveItem: (id: string) => void;
}) {

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [course, setCourse] = useState<Course>("Starter");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceText, setPriceText] = useState("");

  // Toggle tag (ingredient) chips
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((x) => x !== tag);
      if (prev.length >= 4) {
        Alert.alert("Limit reached", "You can select up to 4 tags for a dish.");
        return prev;
      }
      return [...prev, tag];
    });
  };

  // Reset the form
  const clearForm = () => {
    setName("");
    setDesc("");
    setCourse("Starter");
    setSelectedTags([]);
    setPriceText("");
  };

  // Handle adding a menu item - validates price is number > 0
  const handleAdd = () => {
    const price = Number(priceText);

    if (!name.trim()) return Alert.alert("Validation", "Please enter a name for the dish.");
    if (!desc.trim()) return Alert.alert("Validation", "Please enter a description.");
    if (selectedTags.length === 0) return Alert.alert("Validation", "Select at least one tag (e.g., Beef, Chicken).");
    if (Number.isNaN(price) || price <= 0) return Alert.alert("Validation", "Please enter a valid price (number > 0).");

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: name.trim(),
      description: desc.trim(),
      course,
      ingredients: selectedTags,
      price,
    };

    onAdd(newItem);
    clearForm();
    Alert.alert("Saved", "Dish added to Christoffels menu.");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.formHeading}>Add a Dish to Christoffels Menu</Text>

        <Text style={styles.label}>Dish name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g., Classic Beef Burger" style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput value={desc} onChangeText={setDesc} placeholder="Short tasty description..." style={[styles.input, { height: 80 }]} multiline />

        <Text style={styles.label}>Course</Text>
        <View style={styles.courseRow}>
          {(["Starter", "Main", "Dessert", "Drink"] as Course[]).map((c) => {
            const active = course === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCourse(c)}
                style={[
                  styles.pill,
                  active && {
                    backgroundColor: "#e0e0e0",
                    borderColor: "#bdbdbd",
                  },
                ]}
              >
                <Text style={[styles.pillText, active && { color: "#000", fontWeight: "700" }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Select up to 4 tags</Text>
        <View style={styles.ingredientsWrap}>
          {DISH_TAG_OPTIONS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.ingredientChip,
                  active && {
                    backgroundColor: "#f0f0f0",
                    borderColor: "#bdbdbd",
                  },
                ]}
              >
                <Ionicons name={active ? "checkbox" : "square-outline"} size={16} style={{ marginRight: 6 }} />
                <Text style={styles.ingredientText}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Price (Rands)</Text>
        <TextInput value={priceText} onChangeText={setPriceText} placeholder="e.g., 89.99" keyboardType="decimal-pad" style={styles.input} />

        <Pressable onPress={handleAdd} style={styles.primaryBtn}>
          <Ionicons name="save" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Add Dish</Text>
        </Pressable>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 18 }} />

        
        <Text style={styles.sectionSubheading}>Full Menu</Text>

        {menu.length === 0 ? (
          <View style={{ paddingVertical: 24 }}>
            <Text style={{ color: "#777" }}>There are no dishes yet. Add a dish above to populate the menu.</Text>
          </View>
        ) : (
          <FlatList
            data={menu}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardCourse}>{item.course}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                  <Text style={styles.cardIngredients}>Tags: {item.ingredients.join(", ")}</Text>
                  <Text style={styles.cardPrice}>Price: R {item.price.toFixed(2)}</Text>
                </View>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Remove dish",
                      `Delete "${item.name}" from the menu?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => onRemoveItem(item.id),
                        },
                      ]
                    )
                  }
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash" size={18} />
                </Pressable>
              </View>
            )}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


/* -- SETTINGS (FILTER) -- */


/**
 * SettingsFilterScreen mirrors the lecturer's FilterScreen but is labeled as Settings.
 * It allows the chef to filter the menu by course (Starter/Main/Dessert/Drink).
 * This preserves the original useMemo-filter pattern and returns the filtered list.
 */
function SettingsFilterScreen({
  menu,
  filterCourse,
  onChangeCourse,
}: {
  menu: MenuItem[];
  filterCourse: Course | "All";
  onChangeCourse: (c: Course | "All") => void;
}) {
  const filtered = useMemo(() => {
    const result: MenuItem[] = [];
    for (let i = 0; i < menu.length; i++) {
      const item = menu[i];
      if (filterCourse === "All" || item.course === filterCourse) {
        result.push(item);
      }
    }
    return result;
  }, [menu, filterCourse]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={styles.formHeading}>Filter menu by course</Text>

        <View style={styles.courseRow}>
          {(["All", "Starter", "Main", "Dessert", "Drink"] as const).map((c) => {
            const active = filterCourse === c;
            return (
              <Pressable
                key={c}
                onPress={() => onChangeCourse(c)}
                style={[
                  styles.pill,
                  active && {
                    backgroundColor: "#e0e0e0",
                    borderColor: "#bdbdbd",
                  },
                ]}
              >
                <Text style={[styles.pillText, active && { color: "#000", fontWeight: "700" }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* If no results show a friendly state */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No results"
          message="Try a different course or add dishes from the Menu screen."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCourse}>{item.course}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <Text style={styles.cardIngredients}>Tags: {item.ingredients.join(", ")}</Text>
                <Text style={styles.cardPrice}>Price: R {item.price.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}


/* -- (CONTACT) -- */


/**
 * It calculates the average price of dishes that include each tag (Beef/Chicken/etc).
 * For the UI flow requested earlier, this screen is placed under "Contact".
 * That keeps all original logic but relabels it to match your requirement.
 */
function AverageByTagScreen({ menu }: { menu: MenuItem[] }) {
  const rows = useMemo(() => {
    const out: { tag: string; count: number; average: number | null }[] = [];

    for (let i = 0; i < DISH_TAG_OPTIONS.length; i++) {
      const tagName = DISH_TAG_OPTIONS[i];

      let sum = 0;
      let count = 0;

      let index = 0;
      // Use a while loop (like original) to sum prices and counts
      while (index < menu.length) {
        const item = menu[index];
        if (item.ingredients.includes(tagName)) {
          sum = sum + item.price;
          count = count + 1;
        }
        index = index + 1;
      }

      const average = count > 0 ? sum / count : null;
      out.push({ tag: tagName, count, average });
    }

    return out;
  }, [menu]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.formHeading}>Average price by tag</Text>

      {menu.length === 0 ? (
        <EmptyState title="No data yet" message="Add some dishes first, then come back to see averages." />
      ) : (
        <View>
          {rows.map((row) => (
            <View key={row.tag} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{row.tag}</Text>
                <Text style={styles.cardDesc}>Dishes using this tag: {row.count}</Text>
                <Text style={styles.cardPrice}>
                  Average price: {row.average === null ? "N/A" : `R ${row.average.toFixed(2)}`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}


/* -- Small UI helpers -- */


function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="restaurant" size={48} style={{ marginBottom: 8 }} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMsg}>{message}</Text>
    </View>
  );
}


/* -- Styles -- */


/**
 * The style block is intentionally comprehensive and verbose to match
 * Slight color / spacing changes align
 * - large light-gray bars for headings
 * - centered title in header
 * - chef imagery on the right
 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    gap: 12,
  },
  logo: { width: 54, height: 54, borderRadius: 10, backgroundColor: "#fff", marginTop: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#222" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 2 },

  authRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  loginPill: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  signupPill: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  loginText: { fontSize: 12, color: "#333" },
  signupText: { fontSize: 12, color: "#333", fontWeight: "700" },

  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  navItemActive: { backgroundColor: "#fff" },
  navLabel: { fontSize: 12, marginTop: 4, color: "#444" },
  navLabelActive: { fontWeight: "700", color: "#000" },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  statLabel: { fontSize: 12, color: "#789" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#222", marginTop: 6 },

  heroRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: "center",
  },
  heroLeft: { flex: 1 },
  heroRight: { width: 140, alignItems: "center", justifyContent: "center" },
  heroImage: { width: 120, height: 120 },
  bigGrayBox: { backgroundColor: "#e6e6e6", padding: 20, borderRadius: 6 },
  bigGrayText: { fontSize: 28, fontWeight: "700", color: "#222" },

  smallChefThumb: { width: 70, height: 70 },
  aboutText: { color: "#666", lineHeight: 20, fontSize: 13, flex: 1 },

  formHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
  },
  label: { fontSize: 12, color: "#7b8a8a", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  courseRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillText: { fontSize: 13, color: "#37474f" },

  ingredientsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  ingredientChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  ingredientText: { fontSize: 13, color: "#37474f" },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    marginTop: 12,
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  cardCourse: { fontSize: 12, color: "#888", marginTop: 2 },
  cardDesc: { fontSize: 13, color: "#666", marginTop: 6 },
  cardIngredients: { fontSize: 12, color: "#555", marginTop: 8 },
  cardPrice: { fontSize: 14, fontWeight: "700", color: "#111", marginTop: 8 },

  deleteBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignSelf: "flex-start",
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 8 },
  emptyMsg: { fontSize: 13, color: "#7b8a8a", textAlign: "center", marginTop: 6 },

  sectionHeading: { fontSize: 16, fontWeight: "800", marginBottom: 8, color: "#222" },
  sectionSubheading: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#444" },

  smallCard: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    minWidth: 120,
  },
});

