package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aistudio.venusbeachhouse.model.ReviewItem
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun ReviewsView(
    viewModel: VenusViewModel,
    state: VenusUiState,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Avaliações dos Hóspedes",
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = "Veja a experiência de quem já viveu dias inesquecíveis na Vênus Beach House.",
            fontSize = 13.sp,
            color = StoneSubtext,
            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
        )

        // Rating Summary Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = AmberContainer.copy(alpha = 0.4f)),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "5.0",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = AmberDark
                    )
                    Row {
                        repeat(5) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = StarGold,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                    Text(
                        text = "${state.reviews.size} avaliações",
                        fontSize = 11.sp,
                        color = StoneSubtext,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.width(20.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "100% dos hóspedes recomendam",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = StoneText
                    )
                    Text(
                        text = "Elogios frequentes para limpeza, piscina, tranquilidade do bairro e atendimento ágil da anfitriã.",
                        fontSize = 12.sp,
                        color = StoneSubtext,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = { viewModel.openReviewDialog() },
                        colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.testTag("write_review_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.RateReview,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Avaliar Estadia", fontSize = 12.sp, color = Color.White)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Reviews list
        state.reviews.forEach { review ->
            ReviewCard(review = review)
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Add Review Dialog
        if (state.isReviewDialogOpen) {
            AddReviewDialog(
                onDismiss = { viewModel.closeReviewDialog() },
                onSubmit = { name, rating, tripType, comment ->
                    viewModel.submitReview(name, rating, tripType, comment)
                }
            )
        }
    }
}

@Composable
fun ReviewCard(review: ReviewItem) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(AmberContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = review.name.take(1).uppercase(),
                            fontWeight = FontWeight.Bold,
                            color = AmberDark,
                            fontSize = 16.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = review.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = StoneText
                            )
                            if (review.isVerified) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = "Hóspede Verificado",
                                    tint = OceanBlue,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                        Text(
                            text = "${review.date} • ${review.tripType}",
                            fontSize = 11.sp,
                            color = StoneSubtext
                        )
                    }
                }

                Row {
                    repeat(review.rating) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = StarGold,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = review.comment,
                fontSize = 13.sp,
                color = StoneText,
                lineHeight = 18.sp
            )
        }
    }
}

@Composable
fun AddReviewDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, Int, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var rating by remember { mutableIntStateOf(5) }
    var tripType by remember { mutableStateOf("Família") }
    var comment by remember { mutableStateOf("") }

    val tripTypes = listOf("Família", "Casal", "Amigos", "Home Office", "Viagem Solo")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Deixar Avaliação",
                    style = MaterialTheme.typography.titleLarge,
                    color = StoneText
                )
                Text(
                    text = "Conte como foi a sua experiência na Vênus Beach House.",
                    fontSize = 12.sp,
                    color = StoneSubtext,
                    modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Seu Nome") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text("Nota da Hospedagem", fontSize = 12.sp, color = StoneSubtext)
                Row(modifier = Modifier.padding(vertical = 4.dp)) {
                    (1..5).forEach { star ->
                        IconButton(onClick = { rating = star }) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = "$star estrelas",
                                tint = if (star <= rating) StarGold else StoneBorder,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text("Tipo de Viagem", fontSize = 12.sp, color = StoneSubtext)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    tripTypes.take(3).forEach { type ->
                        FilterChip(
                            selected = tripType == type,
                            onClick = { tripType = type },
                            label = { Text(type, fontSize = 11.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Comentário sobre a estadia") },
                    minLines = 3,
                    maxLines = 5,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancelar")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank() && comment.isNotBlank()) {
                                onSubmit(name, rating, tripType, comment)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary),
                        enabled = name.isNotBlank() && comment.isNotBlank()
                    ) {
                        Text("Enviar Avaliação", color = Color.White)
                    }
                }
            }
        }
    }
}
