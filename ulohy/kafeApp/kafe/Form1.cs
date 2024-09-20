using System.Text;
using Newtonsoft.Json.Linq;

namespace kafe
{
    public partial class Form1 : Form
    {
        private readonly HttpClient _client;
        public Form1()
        {
            InitializeComponent();
            _client = new HttpClient();
            _client.DefaultRequestHeaders.Add("Authorization", "Basic " + Convert.ToBase64String(Encoding.ASCII.GetBytes("coffee:kafe")));
            
        }

        private void MainForm_Load(object sender, EventArgs e)
        {

            //zkousel jsem spoustu ruznych metod jak pridat predmety do cmb
            //zadny nefungoval, krome pridavani natrvrdo pres designer
            //tim zpusobem ale nevim, jak prirazovat hodnoty

            cmbMonths.Items.Add(new ComboBoxItem { Text = "Všechny", Value = "0" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Leden", Value = "1" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Únor", Value = "2" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Bøezen", Value = "3" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Duben", Value = "4" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Kvìten", Value = "5" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Èerven", Value = "6" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Èervenec", Value = "7" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Srpen", Value = "8" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Záøí", Value = "9" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Øíjen", Value = "10" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Listopad", Value = "11" });
            cmbMonths.Items.Add(new ComboBoxItem { Text = "Prosinec", Value = "12" });

           // cmbMonths.Items.Insert(12, new ComboBoxItem { Text = "YES", Value = "42" });

            if (cmbMonths.Items.Count > 0)
            {
                cmbMonths.SelectedIndex = 0; 
            }

            LoadUsersAsync().GetAwaiter().GetResult();
            LoadTypesAsync().GetAwaiter().GetResult();
        }



        private async Task LoadUsersAsync()
        {
            var response = await _client.PostAsync("http://ajax1.lmsoft.cz/procedure.php?cmd=getPeopleList", null);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var users = JArray.Parse(data);

                cmbUsers.Items.Clear();

                foreach (var user in users)
                {
                    cmbUsers.Items.Add(new ComboBoxItem { Text = user["name"].ToString(), Value = user["ID"].ToString() });
                }

                if (cmbUsers.Items.Count > 0)
                {
                    cmbUsers.SelectedIndex = 0;
                }
            }
            else
            {
                MessageBox.Show("Cannot load users.");
            }
        }
        
        public class ComboBoxItem
        {
            public string Text { get; set; }
            public string Value { get; set; }

            public override string ToString()
            {
                return Text;
            }
        }
        

        private async Task LoadTypesAsync()
        {
            var response = await _client.PostAsync("http://ajax1.lmsoft.cz/procedure.php?cmd=getTypesList", null);
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var types = JArray.Parse(data);
                foreach (var type in types)
                {
                    var panel = new Panel();
                    var label = new Label { Text = type["typ"].ToString() };
                    var buttonAdd = new Button { Text = "+" };
                    var buttonMinus = new Button { Text = "-" };
                    var numericUpDown = new NumericUpDown { Minimum = 0, Maximum = 99999 };

                    buttonAdd.Click += (s, e) => numericUpDown.Value++;
                    buttonMinus.Click += (s, e) => numericUpDown.Value--;

                    panel.Controls.Add(label);
                    panel.Controls.Add(buttonAdd);
                    panel.Controls.Add(buttonMinus);
                    panel.Controls.Add(numericUpDown);
                    pnlSliders.Controls.Add(panel);
                }
            }
            else
            {
                MessageBox.Show("Cannot load types.");
            }
        }

        private async void button1_Click(object sender, EventArgs e)
        {
            var month = cmbMonths.SelectedIndex > 0 ? cmbMonths.SelectedIndex.ToString() : "0";
            var url = $"http://ajax1.lmsoft.cz/procedure.php?cmd=getSummaryOfDrinks&month={month}";
            var response = await _client.PostAsync(url, null);
            var selectedUser = (ComboBoxItem)cmbUsers.SelectedItem;
            var selectedUserId = selectedUser?.Value;

            var selectedMonth = (ComboBoxItem)cmbMonths.SelectedItem;
            var selectedMonthId = selectedMonth?.Value;


            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var drinks = JArray.Parse(data);

                dgvDrinksList.Columns.Clear();
                dgvDrinksList.Rows.Clear();

                dgvDrinksList.Columns.Add("Name", "Název");
                dgvDrinksList.Columns.Add("Count", "Poèet");
                dgvDrinksList.Columns.Add("Person", "Jméno");

                foreach (var drink in drinks)
                {
                    dgvDrinksList.Rows.Add(drink[0].ToString(), drink[1].ToString(), drink[2].ToString());
                }
            }
            else
            {
                MessageBox.Show("Cannot get data.");
            }
        }
    }
}
