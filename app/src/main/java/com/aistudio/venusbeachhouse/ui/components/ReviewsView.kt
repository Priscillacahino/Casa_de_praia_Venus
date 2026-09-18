package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aistudio.venusbeachhouse.model.ReviewItem
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel

@Composable
fun ReviewsView(viewModel: VenusViewModel, state: VenusUiState, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth().padding(16.dp)) {
        Text("Avaliações dos hóspedes", style = MaterialTheme.typography.headlineMedium)
        Text("O aplicativo não cria avaliações de exemplo nem marca automaticamente um comentário como verificado.", modifier = Modifier.padding(top=6.dp,bottom=16.dp))
        if(state.reviews.isEmpty()) {
            Card(shape=RoundedCornerShape(18.dp), modifier=Modifier.fillMaxWidth()) {
                Column(Modifier.padding(18.dp)) {
                    Text("Nenhuma avaliação verificada publicada no aplicativo", fontWeight=FontWeight.Bold)
                    Text("Quando houver avaliações reais, elas devem ser publicadas somente após moderação e vínculo com uma estadia concluída.", modifier=Modifier.padding(top=6.dp))
                }
            }
        } else {
            state.reviews.forEach { review -> ReviewCardVerified(review); Spacer(Modifier.height(10.dp)) }
        }
    }
}

@Composable
private fun ReviewCardVerified(review: ReviewItem) {
    Card(shape=RoundedCornerShape(18.dp), modifier=Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement=Arrangement.SpaceBetween) {
                Row { Text(review.name,fontWeight=FontWeight.Bold); if(review.isVerified){Spacer(Modifier.width(5.dp));Icon(Icons.Default.Verified,"Hóspede verificado")} }
                Row { repeat(review.rating){Icon(Icons.Default.Star,null)} }
            }
            Text("${review.date} • ${review.tripType}", style=MaterialTheme.typography.bodySmall)
            Text(review.comment, modifier=Modifier.padding(top=8.dp))
        }
    }
}
