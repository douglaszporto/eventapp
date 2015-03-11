package notifiers;

import play.*;
import play.mvc.*;
import java.util.*;

import models.*;

public class Mails extends Mailer {

	public static void NewEvent(EventDateModel ev) {
		setSubject("Evento Criado - " + ev.title);
		setFrom("Event App <eventapp.porto@gmail.com>");

		for(UserModel user : ev.participants) {
			addRecipient(user.email);
		}

		send(ev);
	}

}