using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;

namespace Resume
{
	public class App : Application
	{
        public static MasterDetailPage MasterDetailPage
        {
            get;
            private set;
        }

		public App()
		{
            // The root page of your application

            MasterPage master = new MasterPage();

            MasterDetailPage = new MasterDetailPage
            {
                Master = master,
                Detail = master.NavigationResume,
            };

            MainPage = MasterDetailPage;
		}

		protected override void OnStart()
		{
			// Handle when your app starts
		}

		protected override void OnSleep()
		{
			// Handle when your app sleeps
		}

		protected override void OnResume()
		{
			// Handle when your app resumes
		}
	}
}
