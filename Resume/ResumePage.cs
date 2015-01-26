using System;
using System.Collections.Generic;
using System.Diagnostics; 
using System.IO;
using System.Linq;
using System.Text;
using System.Net;
using Xamarin.Forms;
using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Resume
{
    class ResumePage : ContentPage
    {
        public ResumePage()
        {
            Title = "Resume";
        }

        protected override void OnAppearing()
        {
            base.OnAppearing();

            Content = new StackLayout
            {
                VerticalOptions = LayoutOptions.Center,
                Children =
                {
                    new Label
                    {
                        XAlign = TextAlignment.Center,
                        Text = "Loading...",
                    },
                }
            };

            var client = new RestClient("http://swooby.com/pv/");
            var request = new RestRequest("resume/resume.json", Method.GET);
            request.RequestFormat = DataFormat.Json;
            var asyncHandle = client.ExecuteAsync(request, response =>
            {
                var content = response.Content;

                // Parse text in to JSON dictionary of objects
                var values = JsonConvert.DeserializeObject<Dictionary<string, object>>(content, new JsonConverter[] { new MyConverter() });

                // TODO:(pv) Build JSON in to resume PDF
                // TODO:(pv) Do the above async

                Content = new StackLayout
                {
                    VerticalOptions = LayoutOptions.Center,
                    Children =
                    {
                        new Label
                        {
                            Text = content,
                        },
                    },
                };
            });
        }

        /// <summary>
        /// From http://stackoverflow.com/a/6417753
        /// </summary>
        class MyConverter : CustomCreationConverter<IDictionary<string, object>>
        {
            public override IDictionary<string, object> Create(Type objectType)
            {
                return new Dictionary<string, object>();
            }

            public override bool CanConvert(Type objectType)
            {
                // in addition to handling IDictionary<string, object>
                // we want to handle the deserialization of dict value
                // which is of type object
                return objectType == typeof(object) || base.CanConvert(objectType);
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                if (reader.TokenType == JsonToken.StartObject
                    || reader.TokenType == JsonToken.Null)
                    return base.ReadJson(reader, objectType, existingValue, serializer);

                // if the next token is not an object
                // then fall back on standard deserializer (strings, numbers etc.)
                return serializer.Deserialize(reader);
            }
        }
    }
}
