namespace kafe
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            btnShowList = new Button();
            cmbUsers = new ComboBox();
            cmbMonths = new ComboBox();
            dgvDrinksList = new DataGridView();
            pnlSliders = new Panel();
            ((System.ComponentModel.ISupportInitialize)dgvDrinksList).BeginInit();
            SuspendLayout();
            // 
            // btnShowList
            // 
            btnShowList.Location = new Point(12, 415);
            btnShowList.Name = "btnShowList";
            btnShowList.Size = new Size(75, 23);
            btnShowList.TabIndex = 0;
            btnShowList.Text = "Show List";
            btnShowList.UseVisualStyleBackColor = true;
            btnShowList.Click += button1_Click;
            // 
            // cmbUsers
            // 
            cmbUsers.FormattingEnabled = true;
            cmbUsers.Location = new Point(93, 415);
            cmbUsers.MaxLength = 8;
            cmbUsers.Name = "cmbUsers";
            cmbUsers.Size = new Size(121, 23);
            cmbUsers.TabIndex = 1;
            // 
            // cmbMonths
            // 
            cmbMonths.FormattingEnabled = true;
            cmbMonths.Items.AddRange(new object[] { "Vsechny", "Leden", "Unor", "Brezen", "Duben", "Kveten", "Cerven", "Cervenec", "Srpen", "Zari", "Rijen", "Listopad", "Prosinec" });
            cmbMonths.Location = new Point(220, 415);
            cmbMonths.Name = "cmbMonths";
            cmbMonths.Size = new Size(121, 23);
            cmbMonths.TabIndex = 2;
            // 
            // dgvDrinksList
            // 
            dgvDrinksList.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            dgvDrinksList.Location = new Point(347, 12);
            dgvDrinksList.Name = "dgvDrinksList";
            dgvDrinksList.Size = new Size(441, 397);
            dgvDrinksList.TabIndex = 3;
            // 
            // pnlSliders
            // 
            pnlSliders.Location = new Point(14, 12);
            pnlSliders.Name = "pnlSliders";
            pnlSliders.Size = new Size(327, 397);
            pnlSliders.TabIndex = 4;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Controls.Add(pnlSliders);
            Controls.Add(dgvDrinksList);
            Controls.Add(cmbMonths);
            Controls.Add(cmbUsers);
            Controls.Add(btnShowList);
            Name = "Form1";
            Text = "Form1";
            ((System.ComponentModel.ISupportInitialize)dgvDrinksList).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Button btnShowList;
        private ComboBox cmbUsers;
        private ComboBox cmbMonths;
        private DataGridView dgvDrinksList;
        private Panel pnlSliders;
    }
}
